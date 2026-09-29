export const FEEDS=[
  {category:"Announcement",url:"https://nsearchives.nseindia.com/content/RSS/Online_announcements.xml"},
  {category:"Financial result",url:"https://nsearchives.nseindia.com/content/RSS/Financial_Results.xml"},
  {category:"Corporate action",url:"https://nsearchives.nseindia.com/content/RSS/Corporate_action.xml"},
  {category:"Board meeting",url:"https://nsearchives.nseindia.com/content/RSS/Board_Meetings.xml"}
];
export async function companies():Promise<[string,string][]> {
  const response=await fetch("https://nsearchives.nseindia.com/content/equities/EQUITY_L.csv",{next:{revalidate:86400},signal:AbortSignal.timeout(12000)});
  if(!response.ok)throw new Error("NSE company catalog unavailable");
  const csv=await response.text();
  const rows=csv.split(/\r?\n/).slice(1);
  const items:[string,string][]=[];
  for(const row of rows){
    const fields=row.match(/("(?:[^"]|"")*"|[^,]*)(?:,|$)/g)?.map(x=>x.replace(/,$/,"").replace(/^"|"$/g,"").replace(/""/g,'"'))||[];
    if(fields[0]&&fields[1]&&fields[2]==="EQ")items.push([fields[0].trim(),fields[1].trim()]);
  }
  if(items.length<100)throw new Error("NSE company catalog was incomplete");
  return items;
}
