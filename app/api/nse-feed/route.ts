import {setDefaultResultOrder} from "node:dns";
import {FEEDS} from "../../../lib/market";
export const runtime="nodejs";
export async function GET(request:Request){
  const secret=process.env.SD_FEED_PROXY_TOKEN;
  if(!secret||request.headers.get("x-sd-feed-token")!==secret)return new Response("Unauthorized",{status:401});
  const index=Number(new URL(request.url).searchParams.get("feed"));
  if(!Number.isInteger(index)||index<0||index>=FEEDS.length)return new Response("Invalid feed",{status:400});
  setDefaultResultOrder("ipv4first");
  try{
    const response=await fetch(FEEDS[index].url,{cache:"no-store",signal:AbortSignal.timeout(15000),headers:{Accept:"application/rss+xml,application/xml"}});
    if(!response.ok)return new Response(`NSE HTTP ${response.status}`,{status:502});
    const length=Number(response.headers.get("content-length")||0);
    if(length>5_000_000)return new Response("Feed too large",{status:502});
    const xml=await response.text();
    if(xml.length>5_000_000||!xml.includes("<item"))return new Response("Invalid NSE feed",{status:502});
    return new Response(xml,{headers:{"Content-Type":"application/xml; charset=utf-8","Cache-Control":"no-store"}});
  }catch(e){return new Response(`NSE fetch failed: ${String(e).slice(0,150)}`,{status:502})}
}
