/**
 * This is a demo page to showcase the theme's color palette.
 * Feel free to replace this with your actual app's logic.
 */

function ColorSwatch({ name, bgClass }: { name: string; bgClass: string }) {
  return (
    <div className="group relative">
      <div
        className={`aspect-square rounded-lg border border-border/50 ${bgClass} transition-transform duration-100 group-hover:scale-102`}
      />
      <p className="mt-2 text-xs text-muted-foreground font-mono text-center truncate">{name}</p>
    </div>
  );
}

export default function Page() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="relative max-w-5xl mx-auto px-6 py-20">
          <h1 className="text-6xl font-bold tracking-tight text-balance">Whatsapp</h1>
        </div>
      </div>

      {/* Color Palette */}
      <div className="border-t border-border bg-muted/30">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-semibold mb-2">Color Palette</h2>
          <p className="text-muted-foreground mb-10">All the design tokens included in this theme.</p>

          <div className="grid gap-10">
            {/* Core Colors */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Core</h3>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                <ColorSwatch name="background" bgClass="bg-background" />
                <ColorSwatch name="foreground" bgClass="bg-foreground" />
                <ColorSwatch name="primary" bgClass="bg-primary" />
                <ColorSwatch name="primary-fg" bgClass="bg-primary-foreground" />
                <ColorSwatch name="secondary" bgClass="bg-secondary" />
                <ColorSwatch name="secondary-fg" bgClass="bg-secondary-foreground" />
                <ColorSwatch name="accent" bgClass="bg-accent" />
                <ColorSwatch name="accent-fg" bgClass="bg-accent-foreground" />
              </div>
            </div>

            {/* UI Colors */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">UI Elements</h3>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                <ColorSwatch name="card" bgClass="bg-card" />
                <ColorSwatch name="card-fg" bgClass="bg-card-foreground" />
                <ColorSwatch name="popover" bgClass="bg-popover" />
                <ColorSwatch name="popover-fg" bgClass="bg-popover-foreground" />
                <ColorSwatch name="muted" bgClass="bg-muted" />
                <ColorSwatch name="muted-fg" bgClass="bg-muted-foreground" />
                <ColorSwatch name="border" bgClass="bg-border" />
                <ColorSwatch name="input" bgClass="bg-input" />
              </div>
            </div>

            {/* Status & Chart */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Status & Charts</h3>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                <ColorSwatch name="destructive" bgClass="bg-destructive" />
                <ColorSwatch name="ring" bgClass="bg-ring" />
                <ColorSwatch name="chart-1" bgClass="bg-chart-1" />
                <ColorSwatch name="chart-2" bgClass="bg-chart-2" />
                <ColorSwatch name="chart-3" bgClass="bg-chart-3" />
                <ColorSwatch name="chart-4" bgClass="bg-chart-4" />
                <ColorSwatch name="chart-5" bgClass="bg-chart-5" />
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Sidebar</h3>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                <ColorSwatch name="sidebar" bgClass="bg-sidebar" />
                <ColorSwatch name="sidebar-fg" bgClass="bg-sidebar-foreground" />
                <ColorSwatch name="sidebar-primary" bgClass="bg-sidebar-primary" />
                <ColorSwatch name="sidebar-accent" bgClass="bg-sidebar-accent" />
                <ColorSwatch name="sidebar-border" bgClass="bg-sidebar-border" />
                <ColorSwatch name="sidebar-ring" bgClass="bg-sidebar-ring" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Built with tweakcn</p>
        </div>
      </footer>
    </main>
  );
}