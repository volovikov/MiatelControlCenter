#!/bin/sh
#find . -name "*.js" -exec uglifyjs {} -o {} \;
find . -name "*.css" -exec java -jar extra/yuicompressor-2.4.8.jar {} -v -o {} \;
#find . -name "*.js" -exec java -jar extra/yuicompressor-2.4.8.jar {} -v -o {} \;

