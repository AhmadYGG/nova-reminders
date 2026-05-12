#!/bin/bash

# Script untuk testing manual Web Push Notification
# Usage: ./test-push-manual.sh [command]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

BASE_URL="http://localhost:3000"
CRON_SECRET="${CRON_SECRET}"

function print_header() {
    echo ""
    echo -e "${CYAN}============================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}============================================${NC}"
    echo ""
}

function print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

function print_error() {
    echo -e "${RED}❌ $1${NC}"
}

function print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

function print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

function check_server() {
    print_header "Checking Server Status"
    
    if curl -s "$BASE_URL" > /dev/null; then
        print_success "Server is running at $BASE_URL"
        return 0
    else
        print_error "Server is not running!"
        print_info "Start server with: npm run dev"
        exit 1
    fi
}

function test_vapid_key() {
    print_header "Test: Get VAPID Public Key"
    
    response=$(curl -s "$BASE_URL/api/push/vapid-public-key")
    
    if echo "$response" | grep -q "publicKey"; then
        print_success "VAPID public key endpoint working"
        echo "$response" | jq '.'
    else
        print_error "Failed to get VAPID public key"
        echo "$response"
    fi
}

function test_cron_endpoint() {
    print_header "Test: Cron Check Reminders"
    
    if [ -z "$CRON_SECRET" ]; then
        print_warning "CRON_SECRET not found in .env"
        print_info "Testing without authorization..."
        response=$(curl -s "$BASE_URL/api/cron/check-reminders")
    else
        print_info "Testing with CRON_SECRET..."
        response=$(curl -s -H "Authorization: Bearer $CRON_SECRET" "$BASE_URL/api/cron/check-reminders")
    fi
    
    if echo "$response" | grep -q "success"; then
        print_success "Cron endpoint working"
        echo "$response" | jq '.'
    else
        print_error "Cron endpoint failed"
        echo "$response"
    fi
}

function list_subscriptions() {
    print_header "List Push Subscriptions"
    
    node -e "
    const { PrismaClient } = require('@prisma/client');
    const db = new PrismaClient();
    
    db.pushSubscription.findMany({
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                }
            }
        }
    })
    .then(subs => {
        if (subs.length === 0) {
            console.log('⚠️  No subscriptions found');
            console.log('   Please login to the app and allow notifications');
        } else {
            console.log('📊 Total subscriptions:', subs.length);
            console.log('');
            subs.forEach((sub, i) => {
                console.log(\`📱 Subscription \${i + 1}:\`);
                console.log(\`   User: \${sub.user.name} (\${sub.user.email})\`);
                console.log(\`   Endpoint: \${sub.endpoint.substring(0, 50)}...\`);
                console.log(\`   Created: \${sub.createdAt}\`);
                console.log('');
            });
        }
    })
    .catch(err => {
        console.error('❌ Error:', err.message);
    })
    .finally(() => db.\$disconnect());
    "
}

function test_send_push() {
    print_header "Test: Send Push Notification"
    
    if [ -z "$CRON_SECRET" ]; then
        print_error "CRON_SECRET not found in .env"
        exit 1
    fi
    
    # Get first user with subscription
    userId=$(node -e "
    const { PrismaClient } = require('@prisma/client');
    const db = new PrismaClient();
    
    db.pushSubscription.findFirst({
        include: { user: true }
    })
    .then(sub => {
        if (sub) {
            console.log(sub.userId);
        }
    })
    .finally(() => db.\$disconnect());
    ")
    
    if [ -z "$userId" ]; then
        print_warning "No subscriptions found"
        print_info "Please login to the app and allow notifications first"
        exit 1
    fi
    
    print_info "Sending test push to user: $userId"
    
    response=$(curl -s -X POST "$BASE_URL/api/push/send-test" \
        -H "Authorization: Bearer $CRON_SECRET" \
        -H "Content-Type: application/json" \
        -d "{\"userId\": \"$userId\", \"title\": \"Test Push\", \"message\": \"Test notification from script!\"}")
    
    if echo "$response" | grep -q "success"; then
        print_success "Push notification sent!"
        echo "$response" | jq '.'
        print_info "Check your device for the notification"
    else
        print_error "Failed to send push notification"
        echo "$response"
    fi
}

function check_reminders() {
    print_header "Check Due Reminders"
    
    node -e "
    const { PrismaClient } = require('@prisma/client');
    const db = new PrismaClient();
    
    const now = new Date();
    
    db.task.findMany({
        where: {
            reminderTime: { lte: now },
            isNotificationEnabled: true,
            notificationSent: false,
            deletedAt: null,
            status: 'pending',
        },
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                }
            }
        },
        take: 10,
    })
    .then(tasks => {
        if (tasks.length === 0) {
            console.log('✅ No due reminders at the moment');
        } else {
            console.log(\`📊 Found \${tasks.length} due reminder(s):\`);
            console.log('');
            tasks.forEach((task, i) => {
                console.log(\`\${i + 1}. \${task.title}\`);
                console.log(\`   User: \${task.user.name}\`);
                console.log(\`   Reminder: \${task.reminderTime}\`);
                console.log(\`   Due: \${task.dueDate || 'No deadline'}\`);
                console.log('');
            });
        }
    })
    .catch(err => {
        console.error('❌ Error:', err.message);
    })
    .finally(() => db.\$disconnect());
    "
}

function show_help() {
    echo ""
    echo "Web Push Notification Testing Script"
    echo ""
    echo "Usage: ./test-push-manual.sh [command]"
    echo ""
    echo "Commands:"
    echo "  check-server      - Check if development server is running"
    echo "  vapid-key         - Test VAPID public key endpoint"
    echo "  cron              - Test cron check-reminders endpoint"
    echo "  subscriptions     - List all push subscriptions"
    echo "  send-push         - Send test push notification"
    echo "  check-reminders   - Check tasks with due reminders"
    echo "  all               - Run all tests"
    echo "  help              - Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./test-push-manual.sh check-server"
    echo "  ./test-push-manual.sh subscriptions"
    echo "  ./test-push-manual.sh send-push"
    echo "  ./test-push-manual.sh all"
    echo ""
}

function run_all_tests() {
    check_server
    test_vapid_key
    list_subscriptions
    check_reminders
    test_cron_endpoint
    
    print_header "Summary"
    print_success "All tests completed!"
    print_info "To send test push, run: ./test-push-manual.sh send-push"
}

# Main
case "${1:-help}" in
    check-server)
        check_server
        ;;
    vapid-key)
        check_server
        test_vapid_key
        ;;
    cron)
        check_server
        test_cron_endpoint
        ;;
    subscriptions)
        list_subscriptions
        ;;
    send-push)
        check_server
        test_send_push
        ;;
    check-reminders)
        check_reminders
        ;;
    all)
        run_all_tests
        ;;
    help|*)
        show_help
        ;;
esac
