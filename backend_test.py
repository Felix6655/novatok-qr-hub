#!/usr/bin/env python3
"""
NovaTok QR Hub Backend API Testing Suite
Tests all backend APIs in demo mode
"""

import requests
import json
import uuid
import time
from typing import Dict, Any, Optional

# Configuration
BASE_URL = "https://novatok-qr.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

class NovaTokAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'NovaTok-Test-Suite/1.0'
        })
        self.demo_user = None
        self.demo_token = None
        self.created_qr_codes = []
        
    def log(self, message: str, level: str = "INFO"):
        """Log test messages"""
        print(f"[{level}] {message}")
        
    def test_status_api(self) -> bool:
        """Test GET /api/status"""
        try:
            self.log("Testing Status API...")
            response = self.session.get(f"{API_BASE}/status")
            
            if response.status_code != 200:
                self.log(f"Status API failed with status {response.status_code}", "ERROR")
                return False
                
            data = response.json()
            required_keys = ['supabase', 'stripe', 'web3', 'demo']
            
            for key in required_keys:
                if key not in data:
                    self.log(f"Missing key '{key}' in status response", "ERROR")
                    return False
                    
            self.log(f"Status API response: {json.dumps(data, indent=2)}")
            self.log("✅ Status API working correctly")
            return True
            
        except Exception as e:
            self.log(f"Status API test failed: {str(e)}", "ERROR")
            return False
    
    def test_auth_signup(self) -> bool:
        """Test POST /api/auth/signup"""
        try:
            self.log("Testing Auth Signup...")
            
            signup_data = {
                "email": f"test-{uuid.uuid4().hex[:8]}@novatok.app",
                "password": "testpassword123"
            }
            
            response = self.session.post(f"{API_BASE}/auth/signup", json=signup_data)
            
            if response.status_code != 200:
                self.log(f"Signup failed with status {response.status_code}: {response.text}", "ERROR")
                return False
                
            data = response.json()
            required_keys = ['user', 'session']
            
            for key in required_keys:
                if key not in data:
                    self.log(f"Missing key '{key}' in signup response", "ERROR")
                    return False
                    
            self.demo_user = data['user']
            self.demo_token = data['session']['access_token']
            
            self.log(f"Signup successful for user: {self.demo_user['email']}")
            self.log("✅ Auth Signup working correctly")
            return True
            
        except Exception as e:
            self.log(f"Auth Signup test failed: {str(e)}", "ERROR")
            return False
    
    def test_auth_login(self) -> bool:
        """Test POST /api/auth/login"""
        try:
            self.log("Testing Auth Login...")
            
            login_data = {
                "email": "demo@novatok.app",
                "password": "demopassword"
            }
            
            response = self.session.post(f"{API_BASE}/auth/login", json=login_data)
            
            if response.status_code != 200:
                self.log(f"Login failed with status {response.status_code}: {response.text}", "ERROR")
                return False
                
            data = response.json()
            required_keys = ['user', 'session']
            
            for key in required_keys:
                if key not in data:
                    self.log(f"Missing key '{key}' in login response", "ERROR")
                    return False
                    
            # Update demo user and token
            self.demo_user = data['user']
            self.demo_token = data['session']['access_token']
            
            self.log(f"Login successful for user: {self.demo_user['email']}")
            self.log("✅ Auth Login working correctly")
            return True
            
        except Exception as e:
            self.log(f"Auth Login test failed: {str(e)}", "ERROR")
            return False
    
    def test_auth_session(self) -> bool:
        """Test GET /api/auth/session"""
        try:
            self.log("Testing Auth Session...")
            
            response = self.session.get(f"{API_BASE}/auth/session")
            
            if response.status_code != 200:
                self.log(f"Session check failed with status {response.status_code}", "ERROR")
                return False
                
            data = response.json()
            
            if 'user' not in data:
                self.log("Missing 'user' key in session response", "ERROR")
                return False
                
            self.log(f"Session check successful: {json.dumps(data, indent=2)}")
            self.log("✅ Auth Session working correctly")
            return True
            
        except Exception as e:
            self.log(f"Auth Session test failed: {str(e)}", "ERROR")
            return False
    
    def test_qr_create_all_types(self) -> bool:
        """Test POST /api/qr for all QR types"""
        try:
            self.log("Testing QR Creation for all types...")
            
            qr_types = [
                {
                    "name": "Test Fiat Payment",
                    "type": "fiat",
                    "destination_config": {
                        "amount": 25.99,
                        "currency": "usd",
                        "productName": "Test Product"
                    }
                },
                {
                    "name": "Test Crypto Payment",
                    "type": "crypto",
                    "destination_config": {
                        "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d4d4",
                        "currency": "ETH",
                        "amount": 0.01
                    }
                },
                {
                    "name": "Test NOVA Payment",
                    "type": "nova",
                    "destination_config": {
                        "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d4d4",
                        "amount": 100
                    }
                },
                {
                    "name": "Test NFT Mint",
                    "type": "nft_mint",
                    "destination_config": {
                        "nftName": "Test NFT Collection",
                        "description": "Test NFT for minting",
                        "price": 0.05
                    }
                },
                {
                    "name": "Test NFT Listing",
                    "type": "nft_listing",
                    "destination_config": {
                        "listingId": "listing-123",
                        "price": 0.1,
                        "currency": "ETH"
                    }
                },
                {
                    "name": "Test Multi Option",
                    "type": "multi_option",
                    "destination_config": {
                        "options": [
                            {"type": "fiat", "amount": 10, "currency": "usd"},
                            {"type": "crypto", "amount": 0.005, "currency": "ETH"}
                        ]
                    }
                }
            ]
            
            success_count = 0
            
            for qr_data in qr_types:
                try:
                    response = self.session.post(f"{API_BASE}/qr", json=qr_data)
                    
                    if response.status_code != 201:
                        self.log(f"QR creation failed for type {qr_data['type']}: {response.status_code} - {response.text}", "ERROR")
                        continue
                        
                    data = response.json()
                    
                    if 'qr' not in data or 'qrUrl' not in data:
                        self.log(f"Missing required keys in QR creation response for type {qr_data['type']}", "ERROR")
                        continue
                        
                    qr = data['qr']
                    self.created_qr_codes.append(qr)
                    
                    self.log(f"✅ QR created successfully for type {qr_data['type']}: {qr['slug']}")
                    success_count += 1
                    
                except Exception as e:
                    self.log(f"Error creating QR for type {qr_data['type']}: {str(e)}", "ERROR")
                    
            if success_count == len(qr_types):
                self.log("✅ All QR types created successfully")
                return True
            else:
                self.log(f"Only {success_count}/{len(qr_types)} QR types created successfully", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"QR Creation test failed: {str(e)}", "ERROR")
            return False
    
    def test_qr_list(self) -> bool:
        """Test GET /api/qr"""
        try:
            self.log("Testing QR List...")
            
            response = self.session.get(f"{API_BASE}/qr")
            
            if response.status_code != 200:
                self.log(f"QR list failed with status {response.status_code}", "ERROR")
                return False
                
            data = response.json()
            
            if 'qrCodes' not in data:
                self.log("Missing 'qrCodes' key in list response", "ERROR")
                return False
                
            qr_codes = data['qrCodes']
            self.log(f"Found {len(qr_codes)} QR codes")
            
            # Verify we have the QR codes we created
            if len(self.created_qr_codes) > 0 and len(qr_codes) >= len(self.created_qr_codes):
                self.log("✅ QR List working correctly")
                return True
            else:
                self.log(f"Expected at least {len(self.created_qr_codes)} QR codes, got {len(qr_codes)}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"QR List test failed: {str(e)}", "ERROR")
            return False
    
    def test_qr_get_by_slug(self) -> bool:
        """Test GET /api/qr/[slug]"""
        try:
            self.log("Testing QR Get by Slug...")
            
            if not self.created_qr_codes:
                self.log("No QR codes available for slug test", "ERROR")
                return False
                
            qr = self.created_qr_codes[0]
            slug = qr['slug']
            
            response = self.session.get(f"{API_BASE}/qr/{slug}")
            
            if response.status_code != 200:
                self.log(f"QR get by slug failed with status {response.status_code}", "ERROR")
                return False
                
            data = response.json()
            
            if 'qr' not in data:
                self.log("Missing 'qr' key in slug response", "ERROR")
                return False
                
            returned_qr = data['qr']
            
            if returned_qr['slug'] != slug:
                self.log(f"Slug mismatch: expected {slug}, got {returned_qr['slug']}", "ERROR")
                return False
                
            # Check if scan count was incremented
            if returned_qr['scan_count'] > qr.get('scan_count', 0):
                self.log("✅ Scan count incremented correctly")
                
            self.log("✅ QR Get by Slug working correctly")
            return True
            
        except Exception as e:
            self.log(f"QR Get by Slug test failed: {str(e)}", "ERROR")
            return False
    
    def test_qr_update(self) -> bool:
        """Test PUT /api/qr/[id]"""
        try:
            self.log("Testing QR Update...")
            
            if not self.created_qr_codes:
                self.log("No QR codes available for update test", "ERROR")
                return False
                
            qr = self.created_qr_codes[0]
            qr_id = qr['id']
            
            update_data = {
                "name": "Updated QR Name",
                "is_active": False
            }
            
            response = self.session.put(f"{API_BASE}/qr/{qr_id}", json=update_data)
            
            if response.status_code != 200:
                self.log(f"QR update failed with status {response.status_code}: {response.text}", "ERROR")
                return False
                
            data = response.json()
            
            if 'qr' not in data:
                self.log("Missing 'qr' key in update response", "ERROR")
                return False
                
            updated_qr = data['qr']
            
            if updated_qr['name'] != update_data['name']:
                self.log(f"Name update failed: expected {update_data['name']}, got {updated_qr['name']}", "ERROR")
                return False
                
            if updated_qr['is_active'] != update_data['is_active']:
                self.log(f"Active status update failed: expected {update_data['is_active']}, got {updated_qr['is_active']}", "ERROR")
                return False
                
            self.log("✅ QR Update working correctly")
            return True
            
        except Exception as e:
            self.log(f"QR Update test failed: {str(e)}", "ERROR")
            return False
    
    def test_analytics_event(self) -> bool:
        """Test POST /api/qr/[slug]/event"""
        try:
            self.log("Testing Analytics Event Tracking...")
            
            if not self.created_qr_codes:
                self.log("No QR codes available for analytics test", "ERROR")
                return False
                
            qr = self.created_qr_codes[0]
            slug = qr['slug']
            
            event_types = ['scan', 'clicked', 'paid', 'minted']
            
            for event_type in event_types:
                event_data = {
                    "event_type": event_type,
                    "country": "US",
                    "user_agent": "Test-Agent/1.0",
                    "metadata": {"test": True, "event": event_type}
                }
                
                response = self.session.post(f"{API_BASE}/qr/{slug}/event", json=event_data)
                
                if response.status_code != 200:
                    self.log(f"Event tracking failed for {event_type}: {response.status_code}", "ERROR")
                    return False
                    
                data = response.json()
                
                if not data.get('success'):
                    self.log(f"Event tracking returned success=false for {event_type}", "ERROR")
                    return False
                    
                self.log(f"✅ Event '{event_type}' tracked successfully")
                
            self.log("✅ Analytics Event Tracking working correctly")
            return True
            
        except Exception as e:
            self.log(f"Analytics Event test failed: {str(e)}", "ERROR")
            return False
    
    def test_nft_api(self) -> bool:
        """Test GET /api/nft/[id]"""
        try:
            self.log("Testing NFT API...")
            
            nft_id = "test-nft-123"
            response = self.session.get(f"{API_BASE}/nft/{nft_id}")
            
            if response.status_code != 200:
                self.log(f"NFT API failed with status {response.status_code}", "ERROR")
                return False
                
            data = response.json()
            
            if 'nft' not in data:
                self.log("Missing 'nft' key in NFT response", "ERROR")
                return False
                
            nft = data['nft']
            required_keys = ['id', 'name', 'description', 'image', 'contract', 'chainId']
            
            for key in required_keys:
                if key not in nft:
                    self.log(f"Missing key '{key}' in NFT response", "ERROR")
                    return False
                    
            if nft['id'] != nft_id:
                self.log(f"NFT ID mismatch: expected {nft_id}, got {nft['id']}", "ERROR")
                return False
                
            self.log("✅ NFT API working correctly")
            return True
            
        except Exception as e:
            self.log(f"NFT API test failed: {str(e)}", "ERROR")
            return False
    
    def test_marketplace_api(self) -> bool:
        """Test GET /api/marketplace/[id]"""
        try:
            self.log("Testing Marketplace API...")
            
            listing_id = "test-listing-456"
            response = self.session.get(f"{API_BASE}/marketplace/{listing_id}")
            
            if response.status_code != 200:
                self.log(f"Marketplace API failed with status {response.status_code}", "ERROR")
                return False
                
            data = response.json()
            
            if 'listing' not in data:
                self.log("Missing 'listing' key in Marketplace response", "ERROR")
                return False
                
            listing = data['listing']
            required_keys = ['id', 'nftId', 'name', 'description', 'image', 'price', 'currency', 'seller', 'contract', 'chainId']
            
            for key in required_keys:
                if key not in listing:
                    self.log(f"Missing key '{key}' in Marketplace response", "ERROR")
                    return False
                    
            if listing['id'] != listing_id:
                self.log(f"Listing ID mismatch: expected {listing_id}, got {listing['id']}", "ERROR")
                return False
                
            self.log("✅ Marketplace API working correctly")
            return True
            
        except Exception as e:
            self.log(f"Marketplace API test failed: {str(e)}", "ERROR")
            return False
    
    def test_qr_delete(self) -> bool:
        """Test DELETE /api/qr/[id]"""
        try:
            self.log("Testing QR Delete...")
            
            if not self.created_qr_codes:
                self.log("No QR codes available for delete test", "ERROR")
                return False
                
            # Delete the last QR code
            qr = self.created_qr_codes[-1]
            qr_id = qr['id']
            
            response = self.session.delete(f"{API_BASE}/qr/{qr_id}")
            
            if response.status_code != 200:
                self.log(f"QR delete failed with status {response.status_code}: {response.text}", "ERROR")
                return False
                
            data = response.json()
            
            if not data.get('success'):
                self.log("QR delete returned success=false", "ERROR")
                return False
                
            # Remove from our tracking list
            self.created_qr_codes.pop()
            
            self.log("✅ QR Delete working correctly")
            return True
            
        except Exception as e:
            self.log(f"QR Delete test failed: {str(e)}", "ERROR")
            return False
    
    def test_auth_logout(self) -> bool:
        """Test POST /api/auth/logout"""
        try:
            self.log("Testing Auth Logout...")
            
            response = self.session.post(f"{API_BASE}/auth/logout")
            
            if response.status_code != 200:
                self.log(f"Logout failed with status {response.status_code}", "ERROR")
                return False
                
            data = response.json()
            
            if not data.get('success'):
                self.log("Logout returned success=false", "ERROR")
                return False
                
            # Clear demo session
            self.demo_user = None
            self.demo_token = None
            
            self.log("✅ Auth Logout working correctly")
            return True
            
        except Exception as e:
            self.log(f"Auth Logout test failed: {str(e)}", "ERROR")
            return False
    
    def test_plans_api(self) -> bool:
        """Test GET /api/plans - Get plan comparison data"""
        try:
            self.log("Testing Plans API...")
            
            response = self.session.get(f"{API_BASE}/plans")
            
            if response.status_code != 200:
                self.log(f"Plans API failed with status {response.status_code}", "ERROR")
                return False
                
            data = response.json()
            
            if 'plans' not in data:
                self.log("Missing 'plans' key in plans response", "ERROR")
                return False
                
            plans = data['plans']
            
            # Should have 3 plans: free, pro, business
            if len(plans) != 3:
                self.log(f"Expected 3 plans, got {len(plans)}", "ERROR")
                return False
                
            plan_ids = [plan['id'] for plan in plans]
            expected_plans = ['free', 'pro', 'business']
            
            for expected_plan in expected_plans:
                if expected_plan not in plan_ids:
                    self.log(f"Missing plan '{expected_plan}' in response", "ERROR")
                    return False
                    
            # Verify each plan has required fields
            for plan in plans:
                required_keys = ['id', 'name', 'price', 'features', 'limits']
                for key in required_keys:
                    if key not in plan:
                        self.log(f"Missing key '{key}' in plan {plan.get('id', 'unknown')}", "ERROR")
                        return False
                        
            self.log(f"Plans API response: {json.dumps(data, indent=2)}")
            self.log("✅ Plans API working correctly")
            return True
            
        except Exception as e:
            self.log(f"Plans API test failed: {str(e)}", "ERROR")
            return False
    
    def test_user_plan_api(self) -> bool:
        """Test GET /api/user/plan - Get current user's plan"""
        try:
            self.log("Testing User Plan API...")
            
            if not self.demo_user:
                self.log("No demo user available for user plan test", "ERROR")
                return False
                
            response = self.session.get(f"{API_BASE}/user/plan")
            
            if response.status_code != 200:
                self.log(f"User Plan API failed with status {response.status_code}: {response.text}", "ERROR")
                return False
                
            data = response.json()
            
            if 'plan' not in data:
                self.log("Missing 'plan' key in user plan response", "ERROR")
                return False
                
            plan = data['plan']
            required_keys = ['userId', 'plan', 'effectivePlan', 'limits', 'isActive']
            
            for key in required_keys:
                if key not in plan:
                    self.log(f"Missing key '{key}' in user plan response", "ERROR")
                    return False
                    
            # New users should start with free plan
            if plan['plan'] != 'free':
                self.log(f"Expected new user to have 'free' plan, got '{plan['plan']}'", "ERROR")
                return False
                
            if plan['effectivePlan'] != 'free':
                self.log(f"Expected new user to have 'free' effective plan, got '{plan['effectivePlan']}'", "ERROR")
                return False
                
            # Check limits for free plan
            limits = plan['limits']
            if limits.get('maxQrCodes') != 5:
                self.log(f"Expected free plan to have maxQrCodes=5, got {limits.get('maxQrCodes')}", "ERROR")
                return False
                
            if not plan['isActive']:
                self.log("Expected free plan to be active", "ERROR")
                return False
                
            self.log(f"User Plan API response: {json.dumps(data, indent=2)}")
            self.log("✅ User Plan API working correctly")
            return True
            
        except Exception as e:
            self.log(f"User Plan API test failed: {str(e)}", "ERROR")
            return False
    
    def test_plan_limits_enforcement(self) -> bool:
        """Test plan limits enforcement - free plan should limit to 5 QR codes"""
        try:
            self.log("Testing Plan Limits Enforcement...")
            
            if not self.demo_user:
                self.log("No demo user available for plan limits test", "ERROR")
                return False
                
            # Clear existing QR codes for clean test
            self.created_qr_codes = []
            
            # Create 5 QR codes (should all succeed)
            success_count = 0
            for i in range(5):
                qr_data = {
                    "name": f"Test QR {i+1}",
                    "type": "fiat",
                    "destination_config": {
                        "amount": 10.00,
                        "currency": "usd",
                        "productName": f"Test Product {i+1}"
                    }
                }
                
                response = self.session.post(f"{API_BASE}/qr", json=qr_data)
                
                if response.status_code == 201:
                    data = response.json()
                    if 'qr' in data:
                        self.created_qr_codes.append(data['qr'])
                        success_count += 1
                        self.log(f"✅ QR {i+1}/5 created successfully")
                else:
                    self.log(f"❌ QR {i+1}/5 creation failed: {response.status_code} - {response.text}", "ERROR")
                    
            if success_count != 5:
                self.log(f"Expected to create 5 QR codes, only created {success_count}", "ERROR")
                return False
                
            # Try to create 6th QR code (should FAIL with 403)
            qr_data = {
                "name": "Test QR 6 (should fail)",
                "type": "fiat",
                "destination_config": {
                    "amount": 10.00,
                    "currency": "usd",
                    "productName": "Test Product 6"
                }
            }
            
            response = self.session.post(f"{API_BASE}/qr", json=qr_data)
            
            if response.status_code != 403:
                self.log(f"Expected 403 for 6th QR creation, got {response.status_code}", "ERROR")
                return False
                
            data = response.json()
            
            if 'error' not in data:
                self.log("Missing 'error' key in limit exceeded response", "ERROR")
                return False
                
            if 'limitReached' not in data or not data['limitReached']:
                self.log("Missing or false 'limitReached' flag in response", "ERROR")
                return False
                
            error_message = data['error']
            expected_message_parts = ["maximum", "5", "free plan"]
            
            for part in expected_message_parts:
                if part not in error_message.lower():
                    self.log(f"Expected error message to contain '{part}', got: {error_message}", "ERROR")
                    return False
                    
            self.log(f"✅ Plan limit properly enforced with error: {error_message}")
            self.log("✅ Plan Limits Enforcement working correctly")
            return True
            
        except Exception as e:
            self.log(f"Plan Limits Enforcement test failed: {str(e)}", "ERROR")
            return False
    
    def test_stripe_checkout(self) -> bool:
        """Test POST /api/stripe/checkout (should fail gracefully without config)"""
        try:
            self.log("Testing Stripe Checkout (expected to fail without config)...")
            
            checkout_data = {
                "amount": 25.99,
                "currency": "usd",
                "productName": "Test Product",
                "qrSlug": "test-slug"
            }
            
            response = self.session.post(f"{API_BASE}/stripe/checkout", json=checkout_data)
            
            # Should return 400 with proper error message
            if response.status_code != 400:
                self.log(f"Stripe checkout should return 400, got {response.status_code}", "ERROR")
                return False
                
            data = response.json()
            
            if 'error' not in data or 'configured' not in data:
                self.log("Missing expected keys in Stripe error response", "ERROR")
                return False
                
            if data['configured'] != False:
                self.log("Stripe should not be configured in demo mode", "ERROR")
                return False
                
            self.log("✅ Stripe Checkout properly returns error when not configured")
            return True
            
        except Exception as e:
            self.log(f"Stripe Checkout test failed: {str(e)}", "ERROR")
            return False
    
    def run_all_tests(self) -> Dict[str, bool]:
        """Run all backend tests"""
        self.log("=" * 60)
        self.log("STARTING NOVATOK QR HUB BACKEND API TESTS")
        self.log("=" * 60)
        
        tests = [
            ("Status API", self.test_status_api),
            ("Plans API", self.test_plans_api),
            ("Auth Signup", self.test_auth_signup),
            ("User Plan API", self.test_user_plan_api),
            ("Auth Login", self.test_auth_login),
            ("Auth Session", self.test_auth_session),
            ("Plan Limits Enforcement", self.test_plan_limits_enforcement),
            ("QR Create All Types", self.test_qr_create_all_types),
            ("QR List", self.test_qr_list),
            ("QR Get by Slug", self.test_qr_get_by_slug),
            ("QR Update", self.test_qr_update),
            ("Analytics Event", self.test_analytics_event),
            ("NFT API", self.test_nft_api),
            ("Marketplace API", self.test_marketplace_api),
            ("QR Delete", self.test_qr_delete),
            ("Stripe Checkout", self.test_stripe_checkout),
            ("Auth Logout", self.test_auth_logout),
        ]
        
        results = {}
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            self.log(f"\n--- Running {test_name} ---")
            try:
                result = test_func()
                results[test_name] = result
                if result:
                    passed += 1
                else:
                    self.log(f"❌ {test_name} FAILED", "ERROR")
            except Exception as e:
                self.log(f"❌ {test_name} CRASHED: {str(e)}", "ERROR")
                results[test_name] = False
        
        self.log("\n" + "=" * 60)
        self.log("TEST RESULTS SUMMARY")
        self.log("=" * 60)
        
        for test_name, result in results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            self.log(f"{test_name}: {status}")
        
        self.log(f"\nOverall: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
        
        if passed == total:
            self.log("🎉 ALL TESTS PASSED!", "SUCCESS")
        else:
            self.log(f"⚠️  {total-passed} tests failed", "WARNING")
        
        return results

def main():
    """Main test runner"""
    tester = NovaTokAPITester()
    results = tester.run_all_tests()
    
    # Exit with error code if any tests failed
    failed_tests = [name for name, result in results.items() if not result]
    if failed_tests:
        print(f"\nFailed tests: {', '.join(failed_tests)}")
        exit(1)
    else:
        print("\n🎉 All backend tests passed successfully!")
        exit(0)

if __name__ == "__main__":
    main()