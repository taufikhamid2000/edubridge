#!/bin/bash

# Dashboard Optimization Test Suite
# Run this script to execute all dashboard optimization tests

echo "🧪 Running Dashboard Optimization Test Suite"
echo "============================================="

# Set test environment
export NODE_ENV=test

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to run tests with proper formatting
run_test_suite() {
    local test_name="$1"
    local test_pattern="$2"
    
    echo -e "\n${BLUE}📋 Running: ${test_name}${NC}"
    echo "----------------------------------------"
    
    if npm test -- --testPathPatterns="$test_pattern" --verbose; then
        echo -e "${GREEN}✅ ${test_name} - PASSED${NC}"
        return 0
    else
        echo -e "${RED}❌ ${test_name} - FAILED${NC}"
        return 1
    fi
}

# Initialize test results
total_suites=0
passed_suites=0

echo -e "${YELLOW}Setting up test environment...${NC}"

# Verify test setup
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found. Please run from project root.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Test environment ready${NC}"

# Run API route tests
echo -e "\n${BLUE}🚀 Starting Dashboard Optimization Tests${NC}"

# 1. API Route Tests
total_suites=$((total_suites + 1))
if run_test_suite "API Dashboard Route Tests" "api/dashboard/route.test.ts"; then
    passed_suites=$((passed_suites + 1))
fi

total_suites=$((total_suites + 1))
if run_test_suite "API User Stats Route Tests" "api/user-stats/route.test.ts"; then
    passed_suites=$((passed_suites + 1))
fi

# 2. Service Tests
total_suites=$((total_suites + 1))
if run_test_suite "Dashboard Service Tests" "services/dashboardService.test.ts"; then
    passed_suites=$((passed_suites + 1))
fi

# 3. Component Tests
total_suites=$((total_suites + 1))
if run_test_suite "Dashboard Page Component Tests" "components/dashboard/DashboardPage.test.tsx"; then
    passed_suites=$((passed_suites + 1))
fi

# 4. Integration Tests
total_suites=$((total_suites + 1))
if run_test_suite "Dashboard Optimization Integration Tests" "integration/dashboard-optimization.test.ts"; then
    passed_suites=$((passed_suites + 1))
fi

# Run full test coverage for dashboard optimization
echo -e "\n${BLUE}📊 Running Test Coverage Analysis${NC}"
echo "----------------------------------------"

if npm test -- --coverage --testPathPatterns="(dashboard|api)" --coverageReporters=text-summary; then
    echo -e "${GREEN}✅ Coverage analysis completed${NC}"
else
    echo -e "${YELLOW}⚠️  Coverage analysis failed (non-critical)${NC}"
fi

# Final Results
echo -e "\n${BLUE}📈 Test Results Summary${NC}"
echo "==============================="
echo -e "Total Test Suites: ${total_suites}"
echo -e "Passed: ${GREEN}${passed_suites}${NC}"
echo -e "Failed: ${RED}$((total_suites - passed_suites))${NC}"

if [ $passed_suites -eq $total_suites ]; then
    echo -e "\n${GREEN}🎉 All tests passed! Dashboard optimization is working correctly.${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some tests failed. Please check the output above.${NC}"
    exit 1
fi
