import type { Metadata } from "next";
import { VideoRows } from "@/components/resource-lists";
import { listPublicVideos } from "@/lib/content-repository";
export const metadata: Metadata = { title: "Videóajánlók", description: "Bibliai témákhoz és tanulmányokhoz kapcsolódó magyar nyelvű YouTube-videóajánlók." };
export default async function VideosPage() { const videos = await listPublicVideos(); return <div className="page-shell"><header className="page-intro"><p className="eyebrow">Nézd és hallgasd</p><h1>Videóajánlók</h1><p className="lead">Minden ajánló saját leírást, témakapcsolatokat és – ahol van – kapcsolódó tanulmányt kap.</p></header><VideoRows videos={videos} /></div>; }
