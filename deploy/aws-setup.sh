#!/usr/bin/env bash
#
# One-time AWS setup for Broadway Opticals image storage.
#
# Creates a least-privilege IAM role, attaches it to the EC2 instance, and
# makes the bucket's objects publicly readable so the storefront can display
# them. Safe to re-run — every step is idempotent.
#
# Run it where you already have admin AWS credentials. The easiest place is
# AWS CloudShell (console → terminal icon, top right): it is already
# authenticated as you, so no access key is created, copied or stored.
#
#   bash aws-setup.sh
#
set -euo pipefail

BUCKET=broadway-web-images
REGION=ap-southeast-2
INSTANCE_ID=i-0983513d81c662d1f
ROLE=BroadwayAppRole
PROFILE=BroadwayAppProfile

echo "→ 1/5  IAM role ${ROLE}"
# Trust policy: only the EC2 service may assume this role.
aws iam create-role \
  --role-name "$ROLE" \
  --description "Lets the Broadway Opticals EC2 instance store product images in S3" \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "ec2.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }' >/dev/null 2>&1 && echo "   created" || echo "   already exists"

echo "→ 2/5  permissions (this bucket only)"
# Deliberately scoped to the one bucket, and to the object verbs the upload
# route actually uses. No s3:* and no other bucket.
aws iam put-role-policy \
  --role-name "$ROLE" \
  --policy-name BroadwayS3Images \
  --policy-document "{
    \"Version\": \"2012-10-17\",
    \"Statement\": [
      {
        \"Sid\": \"ObjectReadWrite\",
        \"Effect\": \"Allow\",
        \"Action\": [\"s3:PutObject\", \"s3:GetObject\", \"s3:DeleteObject\"],
        \"Resource\": \"arn:aws:s3:::${BUCKET}/*\"
      },
      {
        \"Sid\": \"BucketList\",
        \"Effect\": \"Allow\",
        \"Action\": [\"s3:ListBucket\", \"s3:GetBucketLocation\"],
        \"Resource\": \"arn:aws:s3:::${BUCKET}\"
      }
    ]
  }"
echo "   attached"

echo "→ 3/5  instance profile"
aws iam create-instance-profile --instance-profile-name "$PROFILE" >/dev/null 2>&1 \
  && echo "   created" || echo "   already exists"
aws iam add-role-to-instance-profile \
  --instance-profile-name "$PROFILE" --role-name "$ROLE" >/dev/null 2>&1 \
  && echo "   role added" || echo "   role already in profile"

# IAM is eventually consistent: associating a profile seconds after creating it
# can fail with "Invalid IAM Instance Profile name".
echo "   waiting for IAM to propagate"
sleep 12

echo "→ 4/5  attaching to instance ${INSTANCE_ID}"
if aws ec2 describe-iam-instance-profile-associations \
     --region "$REGION" \
     --filters "Name=instance-id,Values=${INSTANCE_ID}" \
     --query 'IamInstanceProfileAssociations[?State==`associated`]' \
     --output text | grep -q .; then
  echo "   already associated"
else
  aws ec2 associate-iam-instance-profile \
    --region "$REGION" \
    --instance-id "$INSTANCE_ID" \
    --iam-instance-profile Name="$PROFILE" >/dev/null
  echo "   associated"
fi

echo "→ 5/5  public read on ${BUCKET}"
# Product photos are meant to be seen, so objects are world-readable. Note
# this makes EVERY object in this bucket public — keep it to product imagery
# and put nothing else in it.
aws s3api put-public-access-block \
  --bucket "$BUCKET" \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=false,RestrictPublicBuckets=false"

aws s3api put-bucket-policy --bucket "$BUCKET" --policy "{
  \"Version\": \"2012-10-17\",
  \"Statement\": [{
    \"Sid\": \"PublicReadProductImages\",
    \"Effect\": \"Allow\",
    \"Principal\": \"*\",
    \"Action\": \"s3:GetObject\",
    \"Resource\": \"arn:aws:s3:::${BUCKET}/products/*\"
  }]
}"
echo "   objects under products/ are now publicly readable"

echo
echo "✓ done. Tell Claude, and it will verify an upload end to end."
