/**
 * Create an unlimited license for internal use.
 *
 * Usage:
 *   cd packages/database
 *   npx tsx scripts/create-unlimited-license.ts [password]
 *
 * Requires DATABASE_URL environment variable to be set.
 * Optional: pass a password as argument, otherwise a random one is generated.
 */

import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

const EMAIL = 'hello@takeshapeadventures.com.au';
const ORG_NAME = 'TakeShape Adventures';
const ORG_SLUG = 'takeshape-adventures';
const BCRYPT_SALT_ROUNDS = 10;

function generateLicenseKey(): string {
  return randomBytes(32).toString('hex'); // 64 character hex string
}

async function main() {
  console.log('Creating unlimited license for:', EMAIL);

  // Get password from command line args or generate random one
  const passwordArg = process.argv[2];
  const plainPassword = passwordArg || randomBytes(16).toString('base64').slice(0, 16);
  const hashedPassword = await hash(plainPassword, BCRYPT_SALT_ROUNDS);

  // 1. Create or find user
  let user = await prisma.user.findUnique({
    where: { email: EMAIL },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: EMAIL,
        name: ORG_NAME,
        emailVerified: new Date(),
        password: hashedPassword,
      },
    });
    console.log('✓ Created user:', user.id);
    console.log('✓ Password set');
  } else {
    // Update password on existing user
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });
    console.log('✓ Found existing user:', user.id);
    console.log('✓ Password updated');
  }

  // 2. Create or find organization
  let org = await prisma.organization.findUnique({
    where: { slug: ORG_SLUG },
  });

  if (!org) {
    org = await prisma.organization.create({
      data: {
        slug: ORG_SLUG,
        name: ORG_NAME,
        email: EMAIL,
        licenseEmail: EMAIL,
        licenseStatus: 'active',
        licenseExpiresAt: new Date('2099-12-31'),
      },
    });
    console.log('✓ Created organization:', org.id);
  } else {
    // Update license fields on existing org
    org = await prisma.organization.update({
      where: { id: org.id },
      data: {
        licenseEmail: EMAIL,
        licenseStatus: 'active',
        licenseExpiresAt: new Date('2099-12-31'),
      },
    });
    console.log('✓ Found existing organization:', org.id);
  }

  // 3. Create membership if not exists
  const existingMembership = await prisma.membership.findUnique({
    where: {
      organizationId_userId: {
        organizationId: org.id,
        userId: user.id,
      },
    },
  });

  if (!existingMembership) {
    await prisma.membership.create({
      data: {
        organizationId: org.id,
        userId: user.id,
        role: 'ADMIN',
        isOwner: true,
      },
    });
    console.log('✓ Created membership');
  } else {
    console.log('✓ Membership already exists');
  }

  // 4. Check for existing license
  let license = await prisma.license.findFirst({
    where: {
      organizationId: org.id,
      deletedAt: null,
    },
  });

  if (!license) {
    const licenseKey = generateLicenseKey();
    license = await prisma.license.create({
      data: {
        organizationId: org.id,
        licenseKey: licenseKey,
        maxDomains: 999999, // Unlimited
        expiresAt: new Date('2099-12-31T23:59:59Z'),
        active: true,
        activationCount: 0,
      },
    });
    console.log('✓ Created license');
    console.log('');
    console.log('='.repeat(60));
    console.log('LICENSE KEY:', licenseKey);
    console.log('='.repeat(60));
  } else {
    // Update existing license to unlimited
    license = await prisma.license.update({
      where: { id: license.id },
      data: {
        maxDomains: 999999,
        expiresAt: new Date('2099-12-31T23:59:59Z'),
        active: true,
        deletedAt: null,
      },
    });
    console.log('✓ Updated existing license to unlimited');
    console.log('');
    console.log('='.repeat(60));
    console.log('LICENSE KEY:', license.licenseKey);
    console.log('='.repeat(60));
  }

  // Also update organization with the license key
  await prisma.organization.update({
    where: { id: org.id },
    data: {
      licenseKey: license.licenseKey,
    },
  });

  console.log('');
  console.log('Summary:');
  console.log('  Email:', EMAIL);
  console.log('  Password:', plainPassword);
  console.log('  Organization:', org.name, `(${org.slug})`);
  console.log('  Max Domains: Unlimited (999999)');
  console.log('  Expires: 2099-12-31');
  console.log('');
  console.log('Done!');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
