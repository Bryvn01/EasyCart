#!/usr/bin/env python
"""
Security Audit Script for EasyCart
Runs automated security checks and generates a report.

Usage:
    python security_audit.py [--output report.json]
"""

import os
import sys
import json
import subprocess
from datetime import datetime
from pathlib import Path


class SecurityAuditor:
    def __init__(self, base_dir=None):
        self.base_dir = base_dir or Path(__file__).parent
        self.backend_dir = self.base_dir / 'backend'
        self.results = {
            'timestamp': datetime.now().isoformat(),
            'checks': {},
            'overall_status': 'unknown'
        }

    def run_all_checks(self):
        """Run all security checks."""
        print("🔍 Starting Security Audit...")
        print("=" * 60)

        self.check_environment_variables()
        self.check_settings_security()
        self.check_dependencies()
        self.check_code_security()
        self.check_sensitive_files()

        self.determine_overall_status()
        return self.results

    def check_environment_variables(self):
        """Check for required environment variables."""
        print("\n📋 Checking Environment Variables...")

        required_vars = {
            'production': [
                'SECRET_KEY',
                'DEBUG',
                'ALLOWED_HOSTS',
                'MPESA_ENVIRONMENT',
                'MPESA_VERIFY_SIGNATURES',
                'REDIS_URL',
                'DB_NAME',
                'DB_USER',
                'DB_PASSWORD',
            ],
            'optional': [
                'SENTRY_DSN',
                'MPESA_WEBHOOK_SECRET',
            ]
        }

        env_file = self.backend_dir / '.env'
        issues = []
        warnings = []

        if not env_file.exists():
            issues.append("No .env file found")
        else:
            with open(env_file) as f:
                env_content = f.read()

            for var in required_vars['production']:
                if var not in env_content:
                    issues.append(f"Missing required variable: {var}")
                elif var == 'DEBUG' and 'DEBUG=True' in env_content:
                    issues.append("DEBUG=True found (should be False in production)")
                elif var == 'SECRET_KEY' and 'change-me' in env_content.lower():
                    issues.append("Default SECRET_KEY detected")

            for var in required_vars['optional']:
                if var not in env_content:
                    warnings.append(f"Optional but recommended: {var}")

        self.results['checks']['environment'] = {
            'status': 'fail' if issues else ('warning' if warnings else 'pass'),
            'issues': issues,
            'warnings': warnings
        }

        print(f"   Issues: {len(issues)}, Warnings: {len(warnings)}")

    def check_settings_security(self):
        """Check Django settings.py for security configurations."""
        print("\n🔒 Checking Security Settings...")

        settings_file = self.backend_dir / 'ecommerce' / 'settings.py'
        issues = []

        if not settings_file.exists():
            issues.append("settings.py not found")
        else:
            with open(settings_file) as f:
                content = f.read()

            security_checks = {
                'SECURE_SSL_REDIRECT': 'SSL redirect not enabled',
                'SECURE_HSTS_SECONDS': 'HSTS not configured',
                'CSRF_COOKIE_SECURE': 'CSRF cookie not secure',
                'SESSION_COOKIE_SECURE': 'Session cookie not secure',
                'X_FRAME_OPTIONS': 'Clickjacking protection missing',
            }

            for setting, error_msg in security_checks.items():
                if setting not in content:
                    issues.append(error_msg)

            # Check for dangerous settings
            if 'CORS_ALLOW_ALL_ORIGINS = True' in content and 'not DEBUG' not in content:
                issues.append("CORS_ALLOW_ALL_ORIGINS=True detected (security risk)")

        self.results['checks']['settings'] = {
            'status': 'fail' if issues else 'pass',
            'issues': issues
        }

        print(f"   Issues: {len(issues)}")

    def check_dependencies(self):
        """Check for vulnerable dependencies."""
        print("\n📦 Checking Dependencies...")

        issues = []

        try:
            # Run safety check
            result = subprocess.run(
                ['safety', 'check', '--json'],
                cwd=self.backend_dir,
                capture_output=True,
                text=True,
                timeout=60
            )

            if result.returncode != 0:
                try:
                    vulnerabilities = json.loads(result.stdout)
                    for vuln in vulnerabilities:
                        issues.append(
                            f"{vuln.get('package', 'Unknown')} {vuln.get('installed_version', '')}: "
                            f"{vuln.get('vulnerability', 'Unknown vulnerability')}"
                        )
                except json.JSONDecodeError:
                    issues.append("Could not parse safety check output")

        except FileNotFoundError:
            issues.append("safety not installed (pip install safety)")
        except subprocess.TimeoutExpired:
            issues.append("safety check timed out")
        except Exception as e:
            issues.append(f"Error running safety check: {str(e)}")

        self.results['checks']['dependencies'] = {
            'status': 'fail' if issues else 'pass',
            'issues': issues
        }

        print(f"   Vulnerabilities: {len(issues)}")

    def check_code_security(self):
        """Run bandit security scan on code."""
        print("\n🔍 Scanning Code with Bandit...")

        issues = []

        try:
            result = subprocess.run(
                ['bandit', '-r', '.', '--skip', 'B101,B104', '-f', 'json'],
                cwd=self.backend_dir,
                capture_output=True,
                text=True,
                timeout=120
            )

            try:
                bandit_results = json.loads(result.stdout)

                # Count issues by severity
                for issue in bandit_results.get('results', []):
                    severity = issue.get('issue_severity', 'UNKNOWN')
                    confidence = issue.get('issue_confidence', 'UNKNOWN')

                    if severity in ['HIGH', 'MEDIUM'] and confidence in ['HIGH', 'MEDIUM']:
                        issues.append(
                            f"{severity}/{confidence}: {issue.get('issue_text', 'Unknown')} "
                            f"in {issue.get('filename', 'unknown file')}:{issue.get('line_number', '?')}"
                        )

            except json.JSONDecodeError:
                issues.append("Could not parse bandit output")

        except FileNotFoundError:
            issues.append("bandit not installed (pip install bandit)")
        except subprocess.TimeoutExpired:
            issues.append("bandit scan timed out")
        except Exception as e:
            issues.append(f"Error running bandit: {str(e)}")

        self.results['checks']['code_security'] = {
            'status': 'fail' if issues else 'pass',
            'issues': issues
        }

        print(f"   Security issues: {len(issues)}")

    def check_sensitive_files(self):
        """Check for sensitive files that shouldn't be committed."""
        print("\n📁 Checking for Sensitive Files...")

        issues = []

        sensitive_patterns = [
            '*.pem',
            '*.key',
            '*.p12',
            '*.jks',
            '.env',
            'secrets.json',
            'credentials.json',
        ]

        # Check if .gitignore exists and contains necessary patterns
        gitignore = self.base_dir / '.gitignore'

        if not gitignore.exists():
            issues.append(".gitignore not found")
        else:
            with open(gitignore) as f:
                gitignore_content = f.read()

            required_ignores = ['.env', '*.key', '*.pem', 'secrets.json']
            for pattern in required_ignores:
                if pattern not in gitignore_content:
                    issues.append(f".gitignore missing pattern: {pattern}")

        # Check for actual sensitive files
        for pattern in ['**/.env', '**/*.key', '**/*.pem']:
            for file_path in self.base_dir.glob(pattern):
                if file_path.name != '.env.example':
                    # Check if file is tracked by git
                    try:
                        result = subprocess.run(
                            ['git', 'ls-files', str(file_path)],
                            cwd=self.base_dir,
                            capture_output=True,
                            text=True
                        )
                        if result.stdout.strip():
                            issues.append(f"Sensitive file in git: {file_path.relative_to(self.base_dir)}")
                    except:
                        pass

        self.results['checks']['sensitive_files'] = {
            'status': 'fail' if issues else 'pass',
            'issues': issues
        }

        print(f"   Issues: {len(issues)}")

    def determine_overall_status(self):
        """Determine overall audit status."""
        total_issues = sum(
            len(check.get('issues', []))
            for check in self.results['checks'].values()
        )

        if total_issues == 0:
            self.results['overall_status'] = 'pass'
            self.results['message'] = '✅ All security checks passed!'
        elif total_issues < 5:
            self.results['overall_status'] = 'warning'
            self.results['message'] = f'⚠️  {total_issues} security issues found'
        else:
            self.results['overall_status'] = 'fail'
            self.results['message'] = f'❌ {total_issues} security issues found - review required'

    def print_summary(self):
        """Print audit summary."""
        print("\n" + "=" * 60)
        print("SECURITY AUDIT SUMMARY")
        print("=" * 60)

        for check_name, check_result in self.results['checks'].items():
            status_icon = {
                'pass': '✅',
                'warning': '⚠️',
                'fail': '❌'
            }.get(check_result['status'], '❓')

            print(f"\n{status_icon} {check_name.upper()}: {check_result['status'].upper()}")

            for issue in check_result.get('issues', []):
                print(f"   - {issue}")

            for warning in check_result.get('warnings', []):
                print(f"   ⚠️  {warning}")

        print("\n" + "=" * 60)
        print(self.results['message'])
        print("=" * 60)

    def save_report(self, output_file):
        """Save audit report to JSON file."""
        with open(output_file, 'w') as f:
            json.dump(self.results, f, indent=2)

        print(f"\n📄 Report saved to: {output_file}")


def main():
    """Main entry point."""
    import argparse

    parser = argparse.ArgumentParser(description='Run security audit on EasyCart')
    parser.add_argument('--output', default='security_audit_report.json', help='Output file for report')
    args = parser.parse_args()

    auditor = SecurityAuditor()
    auditor.run_all_checks()
    auditor.print_summary()
    auditor.save_report(args.output)

    # Exit with non-zero if failed
    if auditor.results['overall_status'] == 'fail':
        sys.exit(1)


if __name__ == '__main__':
    main()
