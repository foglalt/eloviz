import Link from "next/link";
import type { AdminAnalyticsOverview, AnalyticsRankingItem } from "@/lib/analytics";

const numberFormat = new Intl.NumberFormat("hu-HU");

function RankingTable({ title, items }: { title: string; items: AnalyticsRankingItem[] }) {
  return (
    <div className="admin-ranking">
      <table className="admin-ranking__table">
        <caption>{title}</caption>
        <thead>
          <tr><th scope="col">#</th><th scope="col">Tartalom</th><th scope="col">Látogató</th><th scope="col">Megtekintés</th></tr>
        </thead>
        <tbody>
          {items.length ? items.map((item, index) => (
            <tr key={item.path}>
              <td className="admin-ranking__position">{index + 1}</td>
              <th scope="row"><Link href={item.path} target="_blank" rel="noopener">{item.title}</Link></th>
              <td>{numberFormat.format(item.visitors)}</td>
              <td>{numberFormat.format(item.views)}</td>
            </tr>
          )) : (
            <tr><td className="admin-ranking__empty" colSpan={4}>Még nincs rögzített megtekintés.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function AdminAnalytics({ overview }: { overview: AdminAnalyticsOverview }) {
  const metrics = [
    { label: "Összes látogató", value: overview.allTimeVisitors },
    { label: "Látogató · 30 nap", value: overview.recentVisitors },
    { label: "Megtekintés · 30 nap", value: overview.recentViews },
    { label: "Összes megtekintés", value: overview.allTimeViews },
  ];

  return (
    <section className="admin-analytics" aria-labelledby="analytics-title">
      <div className="admin-analytics__heading">
        <div><p className="eyebrow">Forgalom</p><h2 id="analytics-title">Népszerű tartalmak</h2></div>
        <p>A toplisták az elmúlt 30 napot mutatják.</p>
      </div>
      <dl className="admin-analytics__metrics">
        {metrics.map((metric) => (
          <div className="admin-analytics__metric" key={metric.label}>
            <dt>{metric.label}</dt>
            <dd>{numberFormat.format(metric.value)}</dd>
          </div>
        ))}
      </dl>
      <div className="admin-ranking-grid">
        <RankingTable title="Témák" items={overview.topics} />
        <RankingTable title="Tanulmányok" items={overview.studies} />
        <RankingTable title="Videók" items={overview.videos} />
      </div>
      <p className="admin-analytics__privacy">Az adatok a mérés bekapcsolásától gyűlnek. Az egyedi látogatók becsült, böngészőnkénti száma; a rendszer nem tárol IP-címet, hivatkozó oldalt vagy keresési kifejezést.</p>
    </section>
  );
}
