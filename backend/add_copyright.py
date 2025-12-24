"""
Copyright Headers for EasyCart Python Files
Add this to the top of every .py file in the project
"""

COPYRIGHT_HEADER = '''"""
EasyCart - E-Commerce Platform
Copyright (c) 2025 Bryvn01. All rights reserved.

This file is part of EasyCart, a proprietary software platform.
Unauthorized copying, modification, or distribution of this file,
via any medium, is strictly prohibited.

For licensing inquiries: admin@easycart.com
"""
'''


def add_copyright_to_file(filepath):
    """Add copyright header to a Python file if not already present"""
    with open(filepath, "r") as f:
        content = f.read()

    if "Copyright (c) 2025 Bryvn01" not in content:
        with open(filepath, "w") as f:
            f.write(COPYRIGHT_HEADER + "\n" + content)
        print(f"Added copyright to {filepath}")
    else:
        print(f"Copyright already present in {filepath}")


# Example usage:
# add_copyright_to_file('apps/products/models.py')
