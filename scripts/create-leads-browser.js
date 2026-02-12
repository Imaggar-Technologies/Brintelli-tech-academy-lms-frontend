/**
 * Browser Console Script to create leads
 * 
 * Copy and paste this entire script into your browser console while logged into the application.
 * Make sure you're on a page where the leadAPI is available.
 * 
 * Or import it in your browser console:
 *   import('./scripts/create-leads-browser.js').then(m => m.createLeads())
 */

// Lead data: email -> name
const leadsData = [
  { email: 'kannapinnaacc@gmail.com', name: 'leo' },
  { email: '1412jones@gmail.com', name: 'jones' },
  { email: 'natarajcse2004@gmail.com', name: 'nataraj' },
  { email: 'imaggartechnologiespvtltd@gmail.com', name: 'maga' },
  { email: 'ck.chandramohan.official@gmail.com', name: 'chandramohan' },
];

// If you want to create multiple leads with same email but different names:
const createMultipleLeadsPerEmail = false; // Set to true to create multiple leads per email

const leadsDataWithVariations = [
  { email: 'kannapinnaacc@gmail.com', names: ['leo', 'Leo', 'LEO', 'Leo Smith'] },
  { email: '1412jones@gmail.com', names: ['jones', 'Jones', 'JONES', 'Jones Doe'] },
  { email: 'natarajcse2004@gmail.com', names: ['nataraj', 'Nataraj', 'NATARAJ', 'Nataraj Kumar'] },
  { email: 'imaggartechnologiespvtltd@gmail.com', names: ['maga', 'Maga', 'MAGA', 'Maga Tech'] },
  { email: 'ck.chandramohan.official@gmail.com', names: ['chandramohan', 'Chandramohan', 'CHANDRAMOHAN', 'C.K. Chandramohan'] },
];

export async function createLeads() {
  // Try to import leadAPI dynamically
  let leadAPI;
  try {
    const leadModule = await import('../src/api/lead.js');
    leadAPI = leadModule.leadAPI || leadModule.default;
  } catch (error) {
    console.error('❌ Could not import leadAPI. Make sure you are running this in the browser console.');
    console.error('Error:', error);
    return;
  }

  console.log('🚀 Starting lead creation...\n');

  const results = {
    created: [],
    failed: [],
  };

  const dataToUse = createMultipleLeadsPerEmail ? leadsDataWithVariations : leadsData;

  if (createMultipleLeadsPerEmail) {
    // Create multiple leads per email with different names
    for (const leadGroup of dataToUse) {
      for (const name of leadGroup.names) {
        console.log(`Creating lead: ${name} (${leadGroup.email})...`);
        try {
          const result = await leadAPI.createLead({
            name,
            email: leadGroup.email,
          });

          if (result.success) {
            console.log(`✅ Successfully created lead: ${name} (${leadGroup.email})`);
            results.created.push({
              email: leadGroup.email,
              name,
              id: result.data?.lead?.id,
            });
          } else {
            throw new Error(result.error || 'Unknown error');
          }
        } catch (error) {
          console.log(`❌ Failed to create lead: ${name} (${leadGroup.email})`);
          console.log(`   Error: ${error.message}`);
          results.failed.push({
            email: leadGroup.email,
            name,
            error: error.message,
          });
        }
        console.log('');
      }
    }
  } else {
    // Create one lead per email
    for (const lead of dataToUse) {
      console.log(`Creating lead: ${lead.name} (${lead.email})...`);
      try {
        const result = await leadAPI.createLead({
          name: lead.name,
          email: lead.email,
        });

        if (result.success) {
          console.log(`✅ Successfully created lead: ${lead.name} (${lead.email})`);
          results.created.push({
            email: lead.email,
            name: lead.name,
            id: result.data?.lead?.id,
          });
        } else {
          throw new Error(result.error || 'Unknown error');
        }
      } catch (error) {
        console.log(`❌ Failed to create lead: ${lead.name} (${lead.email})`);
        console.log(`   Error: ${error.message}`);
        results.failed.push({
          email: lead.email,
          name: lead.name,
          error: error.message,
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

  return results;
}

// Auto-run if in browser console
if (typeof window !== 'undefined') {
  console.log('📋 Lead creation script loaded. Run createLeads() to start.');
  console.log('   Or set createMultipleLeadsPerEmail = true to create multiple leads per email.');
}

