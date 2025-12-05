
import fs from 'fs';
import path from 'path';

function checkEnv() {
    const envPath = path.resolve('.env.local');
    if (!fs.existsSync(envPath)) {
        console.error('❌ .env.local file NOT found!');
        return;
    }

    console.log('✅ .env.local file found.');

    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    const env: Record<string, string> = {};

    for (const line of lines) {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            env[match[1].trim()] = match[2].trim();
        }
    }

    // Check required keys
    const requiredKeys = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'NEXT_PUBLIC_URL'
    ];

    requiredKeys.forEach(key => {
        if (env[key]) {
            console.log(`✅ ${key} is set to: ${env[key]}`);
        } else {
            console.error(`❌ ${key} is MISSING in .env.local`);
        }
    });
}

checkEnv();
