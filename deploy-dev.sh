#!/bin/sh

REV_NAME=$CIRCLE_PROJECT_REPONAME-$CIRCLE_BRANCH-$CIRCLE_BUILD_NUM
echo "REV_NAME:" $REV_NAME

# Create tarball
tar -C dist -cvf artifacts/$REV_NAME.tar .

# Create /var/www directory if not exists
ssh root@{{add-your-domain-here}}.com "mkdir -p /var/www/$REV_NAME;"

# Transfer tarball
scp artifacts/$REV_NAME.tar root@{{add-your-domain-here}}.com:/var/www/$REV_NAME.tar
if [ $? -ne 0 ]; then
  echo "Tarball Transfer Failed"
  exit $?
fi

# Transfer tarball
# Backup current package
# Position new package to be served
# Remove the backup
ssh root@{{add-your-domain-here}}.com "
  mkdir -p /var/www/$REV_NAME;
  mkdir -p /var/www/$CIRCLE_PROJECT_REPONAME;
  tar -xf /var/www/$REV_NAME.tar -C /var/www/$REV_NAME;
  mv /var/www/$CIRCLE_PROJECT_REPONAME /var/www/${CIRCLE_PROJECT_REPONAME}_backup;
  mv /var/www/$REV_NAME /var/www/$CIRCLE_PROJECT_REPONAME;
  rm -rf /var/www/${CIRCLE_PROJECT_REPONAME}_backup;
"

echo "Unpacking Tarball Result: " $?
exit $?
