import { faArrowLeft, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  NavigationRouteRegistry,
  NavigationStackProvider,
  NavigationStackViewport,
  useNavigationEntry,
  useNavigationStack,
  useNavigationTransitions,
  type NavigationReducedMotionPreference,
  type NavigationScreenRenderProps,
  type NavigationTransitionPresetName,
  type NavigationTransitionResolver,
} from 'flow-stack';
import { useMemo, useState } from 'react';

function toTitleCase(s: string): string {
  return s
    .split(/[-\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function HomeScreen() {
  const navigation = useNavigationStack();

  return (
    <div style={screenStyle}>
      <span style={eyebrowStyle}>Home</span>
      <h1 style={titleStyle}>Advanced Example</h1>
      <p style={textStyle}>
        This example shows custom transitions, external controls, route params,
        and stack debugging.
      </p>

      <div style={buttonGroupStyle}>
        <button
          style={buttonStyle}
          onClick={() => navigation.push('category', { name: 'Guides' })}
        >
          Open category
        </button>

        <button
          style={buttonStyle}
          onClick={() =>
            navigation.push(
              'article',
              { slug: 'getting-started' },
              { transition: 'fade-scale' },
            )
          }
        >
          Open article with override
        </button>

        <button
          style={buttonStyle}
          onClick={() => navigation.push('preferences')}
        >
          Open preferences
        </button>
      </div>
    </div>
  );
}

function CategoryScreen({
  params,
}: NavigationScreenRenderProps<{ name?: string }>) {
  const navigation = useNavigationStack();

  return (
    <div style={screenStyle}>
      <span style={eyebrowStyle}>Category</span>
      <h1 style={titleStyle}>{params.name ?? 'Unknown Category'}</h1>
      <p style={textStyle}>
        This route uses the viewport default slide transition.
      </p>

      <div style={buttonGroupStyle}>
        <button
          style={buttonStyle}
          onClick={() =>
            navigation.push('article', {
              slug: `${(params.name ?? 'guides').toLowerCase()}-overview`,
            })
          }
        >
          Open article
        </button>
      </div>
    </div>
  );
}

function ArticleScreen({
  params,
}: NavigationScreenRenderProps<{ slug?: string }>) {
  const navigation = useNavigationStack();

  return (
    <div style={screenStyle}>
      <span style={eyebrowStyle}>Article</span>
      <h1 style={titleStyle}>
        {toTitleCase(params.slug ?? 'Unknown Article')}
      </h1>
      <p style={textStyle}>This route has a route-level fade transition.</p>

      <div style={buttonGroupStyle}>
        <button
          style={buttonStyle}
          onClick={() =>
            navigation.push('article', { slug: 'related-article' })
          }
        >
          Push another article
        </button>
      </div>
    </div>
  );
}

function PreferencesScreen() {
  return (
    <div style={screenStyle}>
      <span style={eyebrowStyle}>Preferences</span>
      <h1 style={titleStyle}>Settings Panel</h1>
      <p style={textStyle}>
        This route uses a route-level vertical transition.
      </p>
    </div>
  );
}

const TRANSITION_PRESETS: NavigationTransitionPresetName[] = [
  'slide-inline',
  'slide-opposite',
  'slide-up',
  'slide-down',
  'fade',
  'fade-scale',
  'none',
];

function ControlsPanel({
  anchor,
  onAnchorChange,
  reducedMotion,
  onReducedMotionChange,
  duration,
  onDurationChange,
  rootTransitionPreset,
  onRootTransitionPresetChange,
}: {
  anchor: 'left' | 'right';
  onAnchorChange: (value: 'left' | 'right') => void;
  reducedMotion: NavigationReducedMotionPreference;
  onReducedMotionChange: (value: NavigationReducedMotionPreference) => void;
  duration: number;
  onDurationChange: (value: number) => void;
  rootTransitionPreset: NavigationTransitionPresetName;
  onRootTransitionPresetChange: (value: NavigationTransitionPresetName) => void;
}) {
  const navigation = useNavigationStack();
  const entry = useNavigationEntry();
  const transition = useNavigationTransitions();

  return (
    <aside style={panelStyle}>
      <div style={panelSectionStyle}>
        <h2 style={panelTitleStyle}>Controls</h2>

        <div style={controlGroupStyle}>
          <label style={controlLabelStyle} htmlFor="anchor-select">
            Anchor
          </label>
          <select
            id="anchor-select"
            style={selectStyle}
            value={anchor}
            onChange={(e) => onAnchorChange(e.target.value as 'left' | 'right')}
          >
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </div>

        <div style={controlGroupStyle}>
          <label style={controlLabelStyle} htmlFor="reduced-motion-select">
            Reduced motion
          </label>
          <select
            id="reduced-motion-select"
            style={selectStyle}
            value={reducedMotion}
            onChange={(e) =>
              onReducedMotionChange(
                e.target.value as NavigationReducedMotionPreference,
              )
            }
          >
            <option value="system">System</option>
            <option value="always">Always</option>
            <option value="never">Never</option>
          </select>
        </div>

        <div style={controlGroupStyle}>
          <label style={controlLabelStyle} htmlFor="duration-slider">
            Duration
          </label>
          <div style={sliderRowStyle}>
            <input
              id="duration-slider"
              type="range"
              min={50}
              max={2000}
              step={10}
              value={duration}
              onChange={(e) => onDurationChange(Number(e.target.value))}
              style={sliderStyle}
            />
            <span style={sliderValueStyle}>{duration}ms</span>
          </div>
        </div>

        <div style={controlGroupStyle}>
          <label style={controlLabelStyle} htmlFor="root-transition-select">
            Root transition
          </label>
          <select
            id="root-transition-select"
            style={selectStyle}
            value={rootTransitionPreset}
            onChange={(e) =>
              onRootTransitionPresetChange(
                e.target.value as NavigationTransitionPresetName,
              )
            }
          >
            {TRANSITION_PRESETS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div style={{ ...buttonGroupStyle, marginTop: 0 }}>
          <button
            style={buttonStyle}
            onClick={() =>
              navigation.push('article', { slug: 'from-controls' })
            }
          >
            Push from controls
          </button>

          <button style={buttonStyle} onClick={() => navigation.pop()}>
            Pop
          </button>

          <button style={buttonStyle} onClick={() => navigation.popToRoot()}>
            Pop to root
          </button>
        </div>
      </div>

      <div style={panelSectionStyle}>
        <h2 style={panelTitleStyle}>State</h2>

        <dl style={definitionListStyle}>
          <div style={definitionRowStyle}>
            <dt style={definitionTermStyle}>Active route</dt>
            <dd style={definitionValueStyle}>{entry.routeName ?? 'none'}</dd>
          </div>

          <div style={definitionRowStyle}>
            <dt style={definitionTermStyle}>Entry key</dt>
            <dd style={definitionValueStyle}>{entry.entryKey ?? 'none'}</dd>
          </div>

          <div style={definitionRowStyle}>
            <dt style={definitionTermStyle}>Index</dt>
            <dd style={definitionValueStyle}>{String(entry.index)}</dd>
          </div>

          <div style={definitionRowStyle}>
            <dt style={definitionTermStyle}>Transitioning</dt>
            <dd style={definitionValueStyle}>{transition.phase ?? 'idle'}</dd>
          </div>

          <div style={definitionRowStyle}>
            <dt style={definitionTermStyle}>Reduced motion</dt>
            <dd style={definitionValueStyle}>{reducedMotion}</dd>
          </div>
        </dl>
      </div>
    </aside>
  );
}

function BackButtonsOverlay({
  anchor,
  duration,
}: {
  anchor: 'left' | 'right';
  duration: number;
}) {
  const navigation = useNavigationStack();
  const { isRoot, index } = useNavigationEntry();

  const translateX = isRoot ? (anchor === 'left' ? '100%' : '-100%') : '0%';

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 10,
        transform: `translateX(${translateX})`,
        transition: `transform ${duration}ms ease, opacity ${duration}ms ease`,
        opacity: isRoot ? 0 : 1,
      }}
    >
      <button
        style={{ ...backButtonStyle, pointerEvents: 'auto' }}
        onClick={() => navigation.pop()}
        aria-label="Back"
      >
        <FontAwesomeIcon icon={faArrowLeft} />
        Back
      </button>

      {index > 1 && (
        <button
          style={{ ...backToRootButtonStyle, pointerEvents: 'auto' }}
          onClick={() => navigation.popToRoot()}
          aria-label="Back to root"
        >
          <FontAwesomeIcon icon={faArrowUp} />
          Back to root
        </button>
      )}
    </div>
  );
}

function ExampleShell({
  anchor,
  reducedMotion,
  duration,
  rootTransitionPreset,
  onAnchorChange,
  onReducedMotionChange,
  onDurationChange,
  onRootTransitionPresetChange,
}: {
  anchor: 'left' | 'right';
  reducedMotion: NavigationReducedMotionPreference;
  duration: number;
  rootTransitionPreset: NavigationTransitionPresetName;
  onAnchorChange: (value: 'left' | 'right') => void;
  onReducedMotionChange: (value: NavigationReducedMotionPreference) => void;
  onDurationChange: (value: number) => void;
  onRootTransitionPresetChange: (value: NavigationTransitionPresetName) => void;
}) {
  return (
    <div style={shellStyle}>
      <ControlsPanel
        anchor={anchor}
        onAnchorChange={onAnchorChange}
        reducedMotion={reducedMotion}
        onReducedMotionChange={onReducedMotionChange}
        duration={duration}
        onDurationChange={onDurationChange}
        rootTransitionPreset={rootTransitionPreset}
        onRootTransitionPresetChange={onRootTransitionPresetChange}
      />

      <div style={{ ...frameStyle, position: 'relative' }}>
        <BackButtonsOverlay anchor={anchor} duration={duration} />
        <NavigationStackViewport
          anchor={anchor}
          reducedMotion={reducedMotion}
          mountStrategy="active-plus-previous"
          ariaLabel="Advanced navigation example"
        />
      </div>
    </div>
  );
}

const routes: NavigationRouteRegistry = [
  { name: 'home', component: HomeScreen },
  { name: 'category', component: CategoryScreen },
  {
    name: 'article',
    component: ArticleScreen,
    transition: 'fade-scale',
  },
  {
    name: 'preferences',
    component: PreferencesScreen,
    transition: 'slide-up',
  },
];

export function App() {
  const [anchor, setAnchor] = useState<'left' | 'right'>('left');
  const [reducedMotion, setReducedMotion] =
    useState<NavigationReducedMotionPreference>('system');
  const [duration, setDuration] = useState(250);
  const [rootTransitionPreset, setRootTransitionPreset] =
    useState<NavigationTransitionPresetName>('slide-inline');

  const transitionResolver = useMemo<NavigationTransitionResolver>(
    () => (context) => {
      if (context.actionType === 'popToRoot') {
        return { preset: rootTransitionPreset, duration };
      }
      return {
        preset: anchor === 'right' ? 'slide-opposite' : 'slide-inline',
        duration,
      };
    },
    [anchor, duration, rootTransitionPreset],
  );

  return (
    <div style={pageStyle}>
      <NavigationStackProvider
        id="advanced-example"
        initialRoute={{ name: 'home' }}
        routes={routes}
        transition={transitionResolver}
        reducedMotion={reducedMotion}
      >
        <ExampleShell
          anchor={anchor}
          reducedMotion={reducedMotion}
          duration={duration}
          rootTransitionPreset={rootTransitionPreset}
          onAnchorChange={setAnchor}
          onReducedMotionChange={setReducedMotion}
          onDurationChange={setDuration}
          onRootTransitionPresetChange={setRootTransitionPreset}
        />
      </NavigationStackProvider>
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  margin: 0,
  display: 'grid',
  placeItems: 'center',
  background: '#f5f5f5',
  fontFamily:
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  padding: 24,
  boxSizing: 'border-box',
};

const shellStyle: React.CSSProperties = {
  width: 'min(980px, 100%)',
  display: 'grid',
  gridTemplateColumns: '280px minmax(320px, 1fr)',
  gap: 24,
  alignItems: 'stretch',
};

const panelStyle: React.CSSProperties = {
  border: '1px solid #d4d4d4',
  borderRadius: 16,
  background: '#ffffff',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
  padding: 16,
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
};

const panelSectionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
};

const panelTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 16,
  lineHeight: 1.2,
};

const frameStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 560,
  border: '1px solid #d4d4d4',
  borderRadius: 16,
  overflow: 'hidden',
  background: '#ffffff',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
};

const screenStyle: React.CSSProperties = {
  position: 'relative',
  boxSizing: 'border-box',
  width: '100%',
  height: '100%',
  padding: 24,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: 12,
  background: '#ffffff',
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#525252',
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 32,
  lineHeight: 1.05,
};

const textStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 16,
  color: '#525252',
  maxWidth: 520,
};

const buttonGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  marginTop: 8,
};

const buttonStyle: React.CSSProperties = {
  appearance: 'none',
  border: 'none',
  borderRadius: 10,
  padding: '12px 16px',
  fontSize: 15,
  cursor: 'pointer',
  background: '#111827',
  color: '#ffffff',
  textAlign: 'left',
};

const definitionListStyle: React.CSSProperties = {
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
};

const definitionRowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '110px 1fr',
  gap: 8,
};

const definitionTermStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 13,
  color: '#737373',
};

const definitionValueStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 13,
  fontFamily:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  color: '#111827',
  overflowWrap: 'anywhere',
};

const backButtonStyle: React.CSSProperties = {
  position: 'absolute',
  top: 12,
  left: 12,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  height: 32,
  borderRadius: 8,
  border: '1.5px solid #e5e5e5',
  background: '#ffffff',
  color: '#111827',
  cursor: 'pointer',
  padding: '0 10px',
  fontSize: 13,
  fontWeight: 500,
  appearance: 'none',
};

const backToRootButtonStyle: React.CSSProperties = {
  position: 'absolute',
  top: 12,
  right: 12,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  height: 32,
  borderRadius: 8,
  border: '1.5px solid #e5e5e5',
  background: '#ffffff',
  color: '#111827',
  cursor: 'pointer',
  padding: '0 10px',
  fontSize: 13,
  fontWeight: 500,
  appearance: 'none',
};

const controlGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

const controlLabelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: '#525252',
  letterSpacing: '0.02em',
};

const selectStyle: React.CSSProperties = {
  border: '1px solid #d4d4d4',
  borderRadius: 8,
  padding: '8px 12px',
  fontSize: 13,
  background: '#ffffff',
  cursor: 'pointer',
  color: '#111827',
  width: '100%',
};

const sliderRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};

const sliderStyle: React.CSSProperties = {
  flex: 1,
  cursor: 'pointer',
  accentColor: '#111827',
};

const sliderValueStyle: React.CSSProperties = {
  fontSize: 12,
  fontFamily:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  color: '#111827',
  minWidth: 42,
  textAlign: 'right',
};
