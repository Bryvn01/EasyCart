#!/usr/bin/env python3
"""
Validation script for MongoDB configuration changes
This script validates the syntax and logic of the database configuration
"""

import ast
import sys
from pathlib import Path

def validate_settings_syntax():
    """Validate settings.py syntax"""
    settings_path = Path(__file__).parent / 'backend' / 'ecommerce' / 'settings.py'
    
    print("Validating settings.py syntax...")
    try:
        with open(settings_path, 'r') as f:
            code = f.read()
        ast.parse(code)
        print("✓ settings.py syntax is valid")
        return True
    except SyntaxError as e:
        print(f"✗ Syntax error in settings.py: {e}")
        return False

def validate_requirements():
    """Validate requirements.txt contains MongoDB packages"""
    req_path = Path(__file__).parent / 'backend' / 'requirements.txt'
    
    print("\nValidating requirements.txt...")
    with open(req_path, 'r') as f:
        requirements = f.read()
    
    checks = [
        ('djongo', 'djongo==1.3.6' in requirements),
        ('pymongo', 'pymongo==3.12.3' in requirements),
    ]
    
    all_valid = True
    for package, present in checks:
        if present:
            print(f"✓ {package} is present in requirements.txt")
        else:
            print(f"✗ {package} is missing from requirements.txt")
            all_valid = False
    
    return all_valid

def validate_env_example():
    """Validate .env.example contains MONGO_URI"""
    env_path = Path(__file__).parent / 'backend' / '.env.example'
    
    print("\nValidating .env.example...")
    with open(env_path, 'r') as f:
        env_content = f.read()
    
    if 'MONGO_URI=' in env_content:
        print("✓ MONGO_URI is present in .env.example")
        return True
    else:
        print("✗ MONGO_URI is missing from .env.example")
        return False

def validate_database_config():
    """Validate database configuration logic in settings.py"""
    settings_path = Path(__file__).parent / 'backend' / 'ecommerce' / 'settings.py'
    
    print("\nValidating database configuration logic...")
    with open(settings_path, 'r') as f:
        content = f.read()
    
    checks = [
        ("MONGO_URI variable", "MONGO_URI = config('MONGO_URI'" in content),
        ("Djongo engine", "'ENGINE': 'djongo'" in content),
        ("MongoDB CLIENT config", "'CLIENT': {" in content),
        ("Database name 'easycart'", "'NAME': 'easycart'" in content),
        ("SQLite fallback", "django.db.backends.sqlite3" in content),
    ]
    
    all_valid = True
    for check_name, present in checks:
        if present:
            print(f"✓ {check_name} configured correctly")
        else:
            print(f"✗ {check_name} not found")
            all_valid = False
    
    return all_valid

def main():
    print("=" * 60)
    print("MongoDB Configuration Validation")
    print("=" * 60)
    
    results = [
        validate_settings_syntax(),
        validate_requirements(),
        validate_env_example(),
        validate_database_config(),
    ]
    
    print("\n" + "=" * 60)
    if all(results):
        print("✓ All validations passed!")
        print("MongoDB Atlas integration is correctly configured.")
        print("\nNext steps:")
        print("1. Install dependencies: pip install -r backend/requirements.txt")
        print("2. Set MONGO_URI in .env file")
        print("3. Run migrations: python backend/manage.py migrate")
        return 0
    else:
        print("✗ Some validations failed. Please review the errors above.")
        return 1

if __name__ == '__main__':
    sys.exit(main())
