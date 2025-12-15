#!/bin/bash

# React Native Project Initialization Script for macOS/Linux
# This script sets up the Android/iOS native folders for the EasyCart mobile app

echo "🚀 EasyCart Mobile - React Native Setup"
echo "========================================"
echo ""

TEMP_PROJECT="EasyCartTemp"
CURRENT_DIR=$(pwd)

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Step 1: Check prerequisites
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm: $NPM_VERSION${NC}"
else
    echo -e "${RED}❌ npm is not installed.${NC}"
    exit 1
fi

# Check for Android tools
echo ""
echo -e "${YELLOW}📱 Checking development tools...${NC}"

if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1)
    echo -e "${GREEN}✅ Java: $JAVA_VERSION${NC}"
else
    echo -e "${YELLOW}⚠️  Java not found. Install JDK 11 or 17 for Android development.${NC}"
fi

if [ -n "$ANDROID_HOME" ]; then
    echo -e "${GREEN}✅ ANDROID_HOME: $ANDROID_HOME${NC}"
else
    echo -e "${YELLOW}⚠️  ANDROID_HOME not set. Android Studio needed for Android builds.${NC}"
fi

# Check for CocoaPods (macOS only)
if [[ "$OSTYPE" == "darwin"* ]]; then
    if command -v pod &> /dev/null; then
        POD_VERSION=$(pod --version)
        echo -e "${GREEN}✅ CocoaPods: $POD_VERSION${NC}"
    else
        echo -e "${YELLOW}⚠️  CocoaPods not found. Run: sudo gem install cocoapods${NC}"
    fi
fi

echo ""
echo -e "${CYAN}🔧 Starting React Native initialization...${NC}"
echo ""

# Step 2: Create temporary React Native project
echo -e "${YELLOW}Creating temporary React Native project...${NC}"
cd ..

npx react-native@latest init $TEMP_PROJECT --skip-install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to create React Native project${NC}"
    cd "$CURRENT_DIR"
    exit 1
fi

echo -e "${GREEN}✅ Temporary project created${NC}"

# Step 3: Copy android and ios folders
echo ""
echo -e "${YELLOW}📁 Copying native folders...${NC}"

if [ -d "$TEMP_PROJECT/android" ]; then
    cp -R "$TEMP_PROJECT/android" mobile/
    echo -e "${GREEN}✅ Android folder copied${NC}"
fi

if [ -d "$TEMP_PROJECT/ios" ]; then
    cp -R "$TEMP_PROJECT/ios" mobile/
    echo -e "${GREEN}✅ iOS folder copied${NC}"
fi

# Step 4: Update Android configuration
echo ""
echo -e "${YELLOW}⚙️  Updating Android configuration...${NC}"

STRINGS_XML="mobile/android/app/src/main/res/values/strings.xml"
if [ -f "$STRINGS_XML" ]; then
    sed -i.bak 's/<string name="app_name">.*<\/string>/<string name="app_name">EasyCart<\/string>/' "$STRINGS_XML"
    rm -f "$STRINGS_XML.bak"
    echo -e "${GREEN}✅ Android app name updated${NC}"
fi

# Step 5: Clean up temp project
echo ""
echo -e "${YELLOW}🧹 Cleaning up...${NC}"
rm -rf $TEMP_PROJECT
echo -e "${GREEN}✅ Temporary files removed${NC}"

# Step 6: Return to mobile directory
cd mobile

# Step 7: Install iOS dependencies (macOS only)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo ""
    echo -e "${YELLOW}📦 Installing iOS dependencies...${NC}"
    npx pod-install ios
fi

echo ""
echo -e "${GREEN}✅ React Native setup complete!${NC}"
echo ""
echo -e "${CYAN}📱 Next Steps:${NC}"
echo -e "${NC}1. Link vector icons: npx react-native-asset${NC}"
echo -e "${NC}2. Run on Android: npm run android${NC}"
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo -e "${NC}3. Run on iOS: npm run ios${NC}"
fi
echo ""
echo -e "${GREEN}🎉 Your app is ready to build!${NC}"
