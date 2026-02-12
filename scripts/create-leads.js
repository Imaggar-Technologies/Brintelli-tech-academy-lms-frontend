/**
 * Script to create leads with specified emails and names
 * 
 * Usage:
 *   node scripts/create-leads.js
 * 
 * Make sure to set your API token as an environment variable:
 *   export TOKEN=your_auth_token_here
 *   (or on Windows: set TOKEN=your_auth_token_here)
 * 
 * Or pass it as an argument:
 *   node scripts/create-leads.js your_auth_token_here
 */

// Lead data: email -> name
const leadsData = [
  { email: 'kannapinnaacc@gmail.com', name: 'leo' },
  { email: '1412jones@gmail.com', name: 'jones' },
  { email: 'natarajcse2004@gmail.com', name: 'nataraj' },
  { email: 'imaggartechnologiespvtltd@gmail.com', name: 'maga' },
  { email: 'ck.chandramohan.official@gmail.com', name: 'chandramohan' }, // Derived name from email
];

// If you want to create multiple leads with same email but different names, set this to true
const CREATE_MULTIPLE_LEADS_PER_EMAIL = process.env.CREATE_MULTIPLE === 'true' || false;

const leadsDataWithVariations = [
  { email: 'kannapinnaacc@gmail.com', names: ['leo', 'Leo', 'LEO', 'Leo Smith'] },
  { email: '1412jones@gmail.com', names: ['jones', 'Jones', 'JONES', 'Jones Doe'] },
  { email: 'natarajcse2004@gmail.com', names: ['nataraj', 'Nataraj', 'NATARAJ', 'Nataraj Kumar'] },
  { email: 'imaggartechnologiespvtltd@gmail.com', names: ['maga', 'Maga', 'MAGA', 'Maga Tech'] },
  { email: 'ck.chandramohan.official@gmail.com', names: ['chandramohan', 'Chandramohan', 'CHANDRAMOHAN', 'C.K. Chandramohan'] },
];

// API Configuration
const API_URL = process.env.VITE_API_BASE_URL || process.env.API_BASE_URL || 'http://192.168.1.4:3000';
const TOKEN = process.argv[2] || process.env.TOKEN;

if (!TOKEN) {
  console.error('❌ Error: Authentication token is required!');
  console.log('\nUsage:');
  console.log('  node scripts/create-leads.js <token>');
  console.log('  or set TOKEN environment variable');
  console.log('\nExample:');
  console.log('  node scripts/create-leads.js eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
  process.exit(1);
}

async function createLead(email, name) {
  try {
    const response = await fetch(`${API_URL}/api/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        name,
        email,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return { success: true, data: data.data?.lead };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function createAllLeads() {
  console.log('🚀 Starting lead creation...\n');
  console.log(`📡 API URL: ${API_URL}`);
  console.log(`📝 Mode: ${CREATE_MULTIPLE_LEADS_PER_EMAIL ? 'Multiple leads per email' : 'One lead per email'}\n`);

  const results = {
    created: [],
    failed: [],
  };

  if (CREATE_MULTIPLE_LEADS_PER_EMAIL) {
    // Create multiple leads per email with different names
    for (const leadGroup of leadsDataWithVariations) {
      for (const name of leadGroup.names) {
        console.log(`Creating lead: ${name} (${leadGroup.email})...`);
        const result = await createLead(leadGroup.email, name);

        if (result.success) {
          console.log(`✅ Successfully created lead: ${name} (${leadGroup.email})`);
          results.created.push({
            email: leadGroup.email,
            name,
            id: result.data?.id,
          });
        } else {
          console.log(`❌ Failed to create lead: ${name} (${leadGroup.email})`);
          console.log(`   Error: ${result.error}`);
          results.failed.push({
            email: leadGroup.email,
            name,
            error: result.error,
          });
        }
        console.log('');
      }
    }
  } else {
    // Create one lead per email
    for (const lead of leadsData) {
      console.log(`Creating lead: ${lead.name} (${lead.email})...`);
      const result = await createLead(lead.email, lead.name);

      if (result.success) {
        console.log(`✅ Successfully created lead: ${lead.name} (${lead.email})`);
        results.created.push({
          email: lead.email,
          name: lead.name,
          id: result.data?.id,
        });
      } else {
        console.log(`❌ Failed to create lead: ${lead.name} (${lead.email})`);
        console.log(`   Error: ${result.error}`);
        results.failed.push({
          email: lead.email,
          name: lead.name,
          error: result.error,
        });
      }
      console.log('');
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Created: ${results.created.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log('');

  if (results.created.length > 0) {
    console.log('Created leads:');
    results.created.forEach((lead) => {
      console.log(`  - ${lead.name} (${lead.email}) - ID: ${lead.id || 'N/A'}`);
    });
    console.log('');
  }

  if (results.failed.length > 0) {
    console.log('Failed leads:');
    results.failed.forEach((lead) => {
      console.log(`  - ${lead.name} (${lead.email})`);
      console.log(`    Error: ${lead.error}`);
    });
  }
}

// Run the script
createAllLeads().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

