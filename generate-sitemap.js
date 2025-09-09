import { SitemapStream, streamToPromise } from "sitemap";
import { createWriteStream } from "fs";

async function generateSitemap() {
  const links = [
    { url: "https://www.esds.co.in/", changefreq: "daily", priority: 1.0 },
    { url: "https://www.esds.co.in/about-esds", changefreq: "monthly", priority: 0.80 },
    { url: "https://www.esds.co.in/cloud-services", changefreq: "monthly", priority: 0.80 },
    { url: "https://www.esds.co.in/soc-as-a-service", changefreq: "monthly", priority: 0.80 },
    { url: "https://www.esds.co.in/contact-us", changefreq: "monthly", priority: 0.80 },
    { url: "https://www.esds.co.in/managed-services", changefreq: "monthly", priority: 0.80 },
    { url: "https://www.esds.co.in/software-as-a-service", changefreq: "monthly", priority: 0.80 },
    { url: "https://www.esds.co.in/colocation-data-centre-services", changefreq: "monthly", priority: 0.80 },
    { url: "https://www.esds.co.in/platform-as-a-service", changefreq: "monthly", priority: 0.80 },
    { url: "https://www.esds.co.in/private-cloud-services", changefreq: "monthly", priority: 0.80 },
    { url: "https://www.esds.co.in/enterprise-cloud-services", changefreq: "monthly", priority: 0.80 },
    { url: "https://www.esds.co.in/bfsi-cloud-services", changefreq: "monthly", priority: 0.80 },
    { url: "https://www.esds.co.in/government-cloud-services", changefreq: "monthly", priority: 0.80 },
    { url: "https://www.esds.co.in/why-esds", changefreq: "monthly", priority: 0.80 },
    { url: "https://www.esds.co.in/whitepapers", changefreq: "monthly", priority: 0.80 },
    { url: "https://www.esds.co.in/investors", changefreq: "monthly", priority: 0.80 },
    { url: "https://www.esds.co.in/esds-peoples/careers/", changefreq: "monthly", priority: 0.80 },
    { url: "https://www.esds.co.in/esds-peoples/news-events/", changefreq: "monthly", priority: 0.80 },
    { url: "https://www.esds.co.in/sap-community-cloud", changefreq: "monthly", priority: 0.80 },
    { url: "https://www.esds.co.in/hana", changefreq: "monthly", priority: 0.80 },
    { url: "https://www.esds.co.in/power-of-zero", changefreq: "monthly", priority: 0.80 },
    { url: "https://www.esds.co.in/ensure-backup-as-a-service", changefreq: "monthly", priority: 0.80 },
    { url: "https://www.esds.co.in/privileged-access-management", changefreq: "monthly", priority: 0.80 },
    { url: "https://www.esds.co.in/enlight-public-cloud-hosting", changefreq: "monthly", priority: 0.80 },
    { url: "https://www.esds.co.in/partner-program", changefreq: "monthly", priority: 0.80 },
    { url: "https://www.esds.co.in/managed-security-services", changefreq: "monthly", priority: 0.80 },
    { url: "https://www.esds.co.in/cloud-hosting-services", changefreq: "monthly", priority: 0.80 },
    { url: "https://www.esds.co.in/backup-as-a-service", changefreq: "monthly", priority: 0.80 },
    { url: "https://www.esds.co.in/disaster-recovery-as-a-service", changefreq: "monthly", priority: 0.80 },
    { url: "https://www.esds.co.in/cloud-migration", changefreq: "monthly", priority: 0.80 },
    { url: "https://www.esds.co.in/vapt-audit", changefreq: "monthly", priority: 0.80 },
    { url: "https://www.esds.co.in/managed-colocation-services", changefreq: "monthly", priority: 0.80 },
    { url: "https://www.esds.co.in/colocation-services", changefreq: "monthly", priority: 0.80 },
    { url: "https://costconfigurator.esds.co.in/public/estimate/index.php", changefreq: "monthly", priority: 0.80 }
    
   
    // Add more pages as needed
  ];

  const stream = new SitemapStream({ hostname: "https://www.esds.co.in/" });
  const writeStream = createWriteStream("./public/sitemap.xml");

  stream.pipe(writeStream);
  links.forEach((link) => stream.write(link));
  stream.end();

  await streamToPromise(stream);
  console.log("Sitemap created successfully!");
}

generateSitemap();