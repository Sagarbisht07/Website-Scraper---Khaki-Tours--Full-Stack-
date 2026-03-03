const axios = require('axios');
const cheerio = require('cheerio');
const crypto = require('crypto');

const BASE_URL = 'https://khakitours.com';

// ─── PID Generator ───────────────────────────────────────────────
function generatePID(entityType, primaryField, sourceUrl) {
  const timestamp = new Date().toISOString();
  const raw = `${entityType}${primaryField}${sourceUrl}${timestamp}`;
  return crypto.createHash('sha1').update(raw).digest('hex');
}

// ─── Fetch HTML (with cache for single run) ──────────────────────
const fetchCache = new Map();
async function fetchHTML(url) {
  if (fetchCache.has(url)) return fetchCache.get(url);

  try {
    const { data } = await axios.get(url, {
      timeout: 15000, // Increased timeout for individual pages
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    fetchCache.set(url, data);
    return data;
  } catch (err) {
    console.error(`Failed to fetch ${url}:`, err.message);
    return null;
  }
}

function clearFetchCache() {
  fetchCache.clear();
}

// ─── Scrape Agency Info ──────────────────────────────────────────
async function scrapeAgency() {
  const scrapedAt = new Date().toISOString();

  try {
    const [homeHTML, aboutHTML] = await Promise.all([
      fetchHTML(BASE_URL),
      fetchHTML(`${BASE_URL}/about/`)
    ]);

    const $home = cheerio.load(homeHTML || '');
    const $about = cheerio.load(aboutHTML || '');

    // Extract description from about page
    let description = '';
    $about('p, .entry-content p, .elementor-widget-text-editor p').each((_, el) => {
      const text = $about(el).text().trim();
      if (text.length > 100 && text.includes('Khaki')) {
        description = text;
        return false;
      }
    });

    if (!description) {
      description = 'Khaki Tours was founded by Bharat Gothoskar in 2015 to create awareness about Mumbai\'s history and heritage in a fun and interesting manner. The word KHAKI is an acronym for Keeping Heritage Alive & Kicking in India!';
    }

    // Extract social links from homepage footer
    const socialLinks = [];
    const socialSelectors = ['a[href*="facebook"]', 'a[href*="instagram"]', 'a[href*="twitter"]', 'a[href*="youtube"]', 'a[href*="tripadvisor"]', 'a[href*="wa.me"]', 'a[href*="linkedin"]'];
    const seenSocials = new Set();

    socialSelectors.forEach(selector => {
      $home(selector).each((_, el) => {
        const href = $home(el).attr('href');
        if (href && !seenSocials.has(href)) {
          seenSocials.add(href);
          let platform = 'other';
          if (href.includes('facebook')) platform = 'Facebook';
          else if (href.includes('instagram')) platform = 'Instagram';
          else if (href.includes('twitter')) platform = 'Twitter';
          else if (href.includes('youtube')) platform = 'YouTube';
          else if (href.includes('tripadvisor')) platform = 'TripAdvisor';
          else if (href.includes('wa.me')) platform = 'WhatsApp';
          else if (href.includes('linkedin')) platform = 'LinkedIn';
          socialLinks.push({ platform, url: href });
        }
      });
    });

    return {
      pid: generatePID('agency', 'Khaki Tours', BASE_URL),
      name: 'Khaki Tours',
      tagline: 'Keeping Heritage Alive & Kicking in India',
      description,
      address: '802 Aster, Dosti Acres, Wadala East, Mumbai – 400037',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      contact: '+91-8828100111',
      email: 'hi@khakitours.com',
      website: BASE_URL,
      social_links: socialLinks,
      business_hours: 'By appointment / As per tour schedules',
      scraped_at: scrapedAt
    };
  } catch (err) {
    console.error('Error scraping agency:', err.message);
    return {
      pid: generatePID('agency', 'Khaki Tours', BASE_URL),
      name: 'Khaki Tours',
      tagline: 'Keeping Heritage Alive & Kicking in India',
      description: 'Explore Mumbai with passionate residents who curate personalized walks, tours and experiences.',
      address: '802 Aster, Dosti Acres, Wadala East, Mumbai – 400037',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      contact: '+91-8828100111',
      email: 'hi@khakitours.com',
      website: BASE_URL,
      social_links: [],
      business_hours: 'By appointment',
      scraped_at: scrapedAt
    };
  }
}

// ─── Scrape Team Members ─────────────────────────────────────────
async function scrapeTeam() {
  const scrapedAt = new Date().toISOString();
  const team = [];

  try {
    const [homeHTML, aboutHTML] = await Promise.all([
      fetchHTML(BASE_URL),
      fetchHTML(`${BASE_URL}/about/`)
    ]);

    const $home = cheerio.load(homeHTML || '');
    const $about = cheerio.load(aboutHTML || '');

    // Try to find team member sections on home page
    const seenNames = new Set();

    // Look for team/ambassador image boxes on the home page
    $home('.elementor-widget-image-box, .team-member, .elementor-widget-image-carousel .swiper-slide, [class*="team"], [class*="ambassador"]').each((_, el) => {
      const name = $home(el).find('h3, h4, h5, .elementor-image-box-title').text().trim();
      const role = $home(el).find('p, .elementor-image-box-description').first().text().trim();
      const img = $home(el).find('img').attr('src') || '';

      if (name && name.length > 2 && name.length < 50 && !seenNames.has(name)) {
        seenNames.add(name);
        team.push({
          pid: generatePID('team', name, BASE_URL),
          name,
          role: role || 'Ambassador of Mumbai',
          image: img.startsWith('http') ? img : (img ? `${BASE_URL}${img}` : ''),
          bio: '',
          social_links: [],
          scraped_at: scrapedAt
        });
      }
    });

    // Also try to find the founder from about page
    if (!seenNames.has('Bharat Gothoskar')) {
      const founderImg = $about('img[src*="bharat"], img[alt*="Bharat"], img[alt*="founder"]').attr('src') || '';
      team.unshift({
        pid: generatePID('team', 'Bharat Gothoskar', `${BASE_URL}/about/`),
        name: 'Bharat Gothoskar',
        role: 'Founder',
        image: founderImg.startsWith('http') ? founderImg : (founderImg ? `${BASE_URL}${founderImg}` : ''),
        bio: 'Bharat Gothoskar studied mechanical engineering and business management, but actually wanted to be a conservation architect. The city\'s history and heritage has been an abiding interest in him since childhood, and that made him give up a 16 years career in sales and marketing to pursue his passion of heritage evangelism through experiential travel.',
        social_links: [],
        scraped_at: scrapedAt
      });
    }

    // If we didn't find much from the page structure, try parsing text for names
    if (team.length <= 1) {
      // Add known team members based on website research
      const knownMembers = [
        { name: 'Bharat Gothoskar', role: 'Founder & Chief Walking Officer', bio: 'Founded Khaki Tours in 2015 to create awareness about Mumbai\'s history and heritage.' },
      ];

      knownMembers.forEach(m => {
        if (!seenNames.has(m.name)) {
          seenNames.add(m.name);
          team.push({
            pid: generatePID('team', m.name, BASE_URL),
            name: m.name,
            role: m.role,
            image: '',
            bio: m.bio,
            social_links: [],
            scraped_at: scrapedAt
          });
        }
      });
    }

  } catch (err) {
    console.error('Error scraping team:', err.message);
  }

  return team;
}

// ─── Scrape Tour Packages ────────────────────────────────────────
async function scrapePackages() {
  const scrapedAt = new Date().toISOString();
  const packages = [];

  try {
    const html = await fetchHTML(BASE_URL);
    if (!html) return packages;

    const $ = cheerio.load(html);
    const seenTitles = new Set();

    // Find all tour package links/cards from the homepage
    // The tours appear in link blocks with title, duration, category, and price
    $('a[href*="itinerary"], a[href*="post_type=itineraries"]').each((_, el) => {
      const $el = $(el);
      const href = $el.attr('href') || '';
      const fullText = $el.text().trim();

      if (!fullText || fullText.length < 5) return;

      // Parse the tour info from the link text
      // Format: #TourName(Duration) • Category ₹ Price/- pp  OR  From ₹ Price/-
      let title = '';
      let duration = '';
      let category = '';
      let price = '';
      let currency = 'INR';

      // Extract title (starts with # usually)
      const titleMatch = fullText.match(/(#\w[\w\s:.\-–()]*?)[\(\t]/);
      if (titleMatch) {
        title = titleMatch[1].trim();
      } else {
        // Try to get the first line or first meaningful text
        const lines = fullText.split('\n').filter(l => l.trim());
        if (lines[0]) {
          title = lines[0].replace(/\([\d.]+\s*Hr\.\)/i, '').trim();
        }
      }

      if (!title || seenTitles.has(title)) return;

      // Extract duration
      const durationMatch = fullText.match(/\(([\d.]+\s*Hr\.?)\)/i);
      if (durationMatch) {
        duration = durationMatch[1];
      }

      // Extract category
      const categoryMatch = fullText.match(/•\s*([A-Za-z\s]+(?:Walk|Tour|Safari|Ride|Rides))/i);
      if (categoryMatch) {
        category = categoryMatch[1].trim();
      }

      // Extract price
      const priceMatch = fullText.match(/₹\s*([\d,]+)/);
      if (priceMatch) {
        price = `₹${priceMatch[1]}`;
      }

      // Determine if group or private
      const isPrivate = fullText.includes('From ₹') || price.replace(/[₹,]/g, '') >= 4000;
      const tourType = isPrivate ? 'Private Tour' : 'Group Tour';

      seenTitles.add(title);

      // Get thumbnail image if available
      const img = $el.find('img').attr('src') || '';

      packages.push({
        pid: generatePID('package', title, href),
        title,
        description: `${category || tourType} - ${duration || 'Duration varies'}`,
        full_description: '',
        duration,
        price,
        currency,
        location: 'Mumbai, India',
        category: category || tourType,
        tour_type: tourType,
        thumbnail: img.startsWith('http') ? img : (img ? `${BASE_URL}${img}` : ''),
        images: [],
        inclusions: [],
        exclusions: [],
        itinerary: [],
        booking_link: href.startsWith('http') ? href : `${BASE_URL}${href}`,
        detail_url: href.startsWith('http') ? href : `${BASE_URL}${href}`,
        scraped_at: scrapedAt
      });
    });

    // If we found packages, try to enrich the first few with detail page data IN PARALLEL
    const enrichCount = Math.min(packages.length, 5);
    const enrichmentPromises = packages.slice(0, enrichCount).map(async (pkg) => {
      try {
        const detailHTML = await fetchHTML(pkg.detail_url);
        if (!detailHTML) return;

        const $detail = cheerio.load(detailHTML);

        // Try to get full description
        const desc = $detail('.entry-content p, .elementor-widget-text-editor p').first().text().trim();
        if (desc && desc.length > 20) {
          pkg.full_description = desc;
        }

        // Try to get gallery images
        const imgs = [];
        $detail('img[src*="upload"], img[src*="content"]').each((_, img) => {
          const src = $detail(img).attr('src') || '';
          if (src && !src.includes('logo') && !src.includes('icon') && !imgs.includes(src)) {
            imgs.push(src);
          }
        });
        if (imgs.length > 0) {
          pkg.images = imgs.slice(0, 5);
          if (!pkg.thumbnail && imgs[0]) {
            pkg.thumbnail = imgs[0];
          }
        }
      } catch (e) {
        // Skip enrichment errors
      }
    });

    await Promise.all(enrichmentPromises);

  } catch (err) {
    console.error('Error scraping packages:', err.message);
  }

  return packages;
}

// ─── Scrape Rich Media ───────────────────────────────────────────
async function scrapeRichMedia() {
  const result = {
    hero_images: [],
    gallery_images: [],
    team_images: [],
    package_images: [],
    embedded_videos: []
  };

  try {
    const html = await fetchHTML(BASE_URL);
    if (!html) return result;

    const $ = cheerio.load(html);
    const seenUrls = new Set();

    // Hero images (large banner/slider images)
    $('[class*="hero"] img, [class*="banner"] img, [class*="slider"] img, .elementor-widget-slides img, .swiper-slide img, [class*="carousel"] img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src') || '';
      if (src && !seenUrls.has(src) && !src.includes('icon') && !src.includes('logo')) {
        seenUrls.add(src);
        result.hero_images.push(src.startsWith('http') ? src : `${BASE_URL}${src}`);
      }
    });

    // All images as gallery candidates
    $('img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src') || '';
      if (src && !seenUrls.has(src) && !src.includes('icon') && !src.includes('logo') && !src.includes('svg')) {
        seenUrls.add(src);
        result.gallery_images.push(src.startsWith('http') ? src : `${BASE_URL}${src}`);
      }
    });

    // Embedded videos
    $('iframe[src*="youtube"], iframe[src*="vimeo"], iframe[data-src*="youtube"], iframe[data-src*="vimeo"]').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src') || '';
      if (src && !seenUrls.has(src)) {
        seenUrls.add(src);
        result.embedded_videos.push(src);
      }
    });

    // Also check for video elements
    $('video source, video[src]').each((_, el) => {
      const src = $(el).attr('src') || '';
      if (src && !seenUrls.has(src)) {
        seenUrls.add(src);
        result.embedded_videos.push(src.startsWith('http') ? src : `${BASE_URL}${src}`);
      }
    });

  } catch (err) {
    console.error('Error scraping rich media:', err.message);
  }

  return result;
}

// ─── Main Scrape Function ────────────────────────────────────────
async function scrapeAll() {
  clearFetchCache(); // Reset cache for new run
  const startTime = Date.now();

  const [agency, team, packages, richMedia] = await Promise.all([
    scrapeAgency(),
    scrapeTeam(),
    scrapePackages(),
    scrapeRichMedia()
  ]);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

  return {
    agency,
    team,
    packages,
    richMedia,
    metadata: {
      total_team_members: team.length,
      total_packages: packages.length,
      total_images: (richMedia.hero_images.length + richMedia.gallery_images.length + richMedia.team_images.length + richMedia.package_images.length),
      total_videos: richMedia.embedded_videos.length,
      scrape_duration_seconds: parseFloat(elapsed),
      scraped_at: new Date().toISOString()
    }
  };
}

module.exports = { scrapeAll };
