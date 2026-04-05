#!/bin/bash

REPORT="analysis_report.txt"

echo "=== Repository Analysis Report ===" > $REPORT
echo "" >> $REPORT

# -------------------------
# KIELTEN TUNNISTUS
# -------------------------
echo "Detected languages:" | tee -a $REPORT

detect_lang () {
  if find . -type f -name "$1" | grep -q .; then
    echo "- $2" | tee -a $REPORT
  fi
}

detect_lang "*.py" "Python"
detect_lang "*.js" "JavaScript"
detect_lang "*.ts" "TypeScript"
detect_lang "*.java" "Java"
detect_lang "*.cpp" "C++"
detect_lang "*.c" "C"
detect_lang "*.cs" "C#"
detect_lang "*.go" "Go"
detect_lang "*.rb" "Ruby"
detect_lang "*.html" "HTML"
detect_lang "*.css" "CSS"

echo "" | tee -a $REPORT

# -------------------------
# SUUNNITTELUMALLIT
# -------------------------
echo "Detected design patterns:" | tee -a $REPORT

FOUND=0

check_pattern () {
  if grep -R -E "$1" . > /dev/null 2>&1; then
    echo "- $2" | tee -a $REPORT
    FOUND=1
  fi
}

# Singleton
check_pattern "getInstance|static instance" "Singleton"

# Factory Method
check_pattern "create[A-Z]|factory" "Factory Method"

# Strategy
check_pattern "Strategy|interface.*Strategy" "Strategy"

# Observer
check_pattern "notify|subscribe|observer" "Observer"

# Decorator
check_pattern "Decorator|wrap" "Decorator"

if [ $FOUND -eq 0 ]; then
  echo "No common design patterns detected" | tee -a $REPORT
fi

echo "" | tee -a $REPORT

# -------------------------
# YHTEENVETO
# -------------------------
echo "Analysis complete." | tee -a $REPORT