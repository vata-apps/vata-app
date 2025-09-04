import { Link, useParams } from '@tanstack/react-router'

function PlacePage() {
  const { treeId, placeId } = useParams({ from: '/$treeId/places/$placeId' })

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "20px" }}>
        <Link to="/$treeId/places" params={{ treeId }} style={{ color: "#666" }}>
          ← Back to Places
        </Link>
      </div>
      
      <h1>Place: {placeId}</h1>
      <p>Tree: <strong>{treeId}</strong></p>

      <div style={{ marginTop: "30px", padding: "20px", backgroundColor: "#f0f0f0" }}>
        <p><strong>This is where we'll display place details:</strong></p>
        <ul>
          <li>Place name and hierarchy</li>
          <li>GPS coordinates</li>
          <li>Related events</li>
          <li>Related individuals and families</li>
        </ul>
      </div>

      <div style={{ marginTop: "30px" }}>
        <h3>URL Structure Working! 🎉</h3>
        <p>We successfully have:</p>
        <ul>
          <li>Tree ID: <code>{treeId}</code></li>
          <li>Place ID: <code>{placeId}</code></li>
        </ul>
      </div>
    </div>
  );
}

export default PlacePage;