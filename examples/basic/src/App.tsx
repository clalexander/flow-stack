import {
  NavigationStackProvider,
  NavigationStackScreen,
  NavigationStackViewport,
  useNavigationStack,
  type NavigationScreenRenderProps,
} from 'flow-stack';

function HomeScreen(_props: NavigationScreenRenderProps) {
  const navigation = useNavigationStack();

  return (
    <div style={screenStyle}>
      <h1 style={titleStyle}>Home</h1>
      <p style={textStyle}>This is the smallest useful FlowStack example.</p>

      <button
        style={buttonStyle}
        onClick={() => navigation.push('details', { id: '42' })}
      >
        Open details
      </button>
    </div>
  );
}

function DetailsScreen({ params }: NavigationScreenRenderProps) {
  const navigation = useNavigationStack();
  const id = typeof params.id === 'string' ? params.id : 'unknown';

  return (
    <div style={screenStyle}>
      <h1 style={titleStyle}>Details</h1>
      <p style={textStyle}>Item ID: {id}</p>

      <button style={buttonStyle} onClick={() => navigation.pop()}>
        Back
      </button>
    </div>
  );
}

export function App() {
  return (
    <div style={pageStyle}>
      <div style={frameStyle}>
        <NavigationStackProvider
          id="basic-example"
          initialRoute={{ name: 'home' }}
        >
          <NavigationStackScreen name="home" component={HomeScreen} />
          <NavigationStackScreen name="details" component={DetailsScreen} />
          <NavigationStackViewport />
        </NavigationStackProvider>
      </div>
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
};

const frameStyle: React.CSSProperties = {
  width: 320,
  height: 480,
  border: '1px solid #d4d4d4',
  borderRadius: 12,
  overflow: 'hidden',
  background: '#ffffff',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
};

const screenStyle: React.CSSProperties = {
  boxSizing: 'border-box',
  width: '100%',
  height: '100%',
  padding: 20,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: 12,
  background: '#ffffff',
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 28,
  lineHeight: 1.1,
};

const textStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 16,
  color: '#525252',
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
};
