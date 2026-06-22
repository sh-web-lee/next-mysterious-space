import dynamic from "next/dynamic";

// ── SSR: 服务端渲染的加载壳，在浏览器第一时间显示 ──
function LoadingShell() {
  return (
    <div
      id="ssr-loading-shell"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#070707",
      }}
    >
      <div className="loading-text">
        <div className="subtitle">ENTER ZGOODorDIE SPACE</div>
        <div className="progress-text">0%</div>
      </div>
    </div>
  );
}

// ── CSR: Three.js/WebGL 只能在浏览器运行，客户端按需加载 ──
const App = dynamic(() => import("@/components/App"), {
  ssr: false,
  loading: () => <LoadingShell />,
});

export default function Page() {
  return <App />;
}
