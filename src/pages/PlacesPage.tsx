import { Link, useParams } from '@tanstack/react-router'

function PlacesPage() {
  const { treeId } = useParams({ from: '/$treeId/places' })

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "20px" }}>
        <Link to="/$treeId" params={{ treeId }} style={{ color: "#666" }}>
          ← Back to {treeId}
        </Link>
      </div>
      
      <h1>Places in {treeId}</h1>
      <p>Here you'll manage all the geographic locations in your family history.</p>

      <div style={{ marginTop: "30px", padding: "20px", backgroundColor: "#f0f0f0" }}>
        <p><strong>Coming soon:</strong></p>
        <ul>
          <li>List of all places</li>
          <li>Add new places</li>
          <li>Edit existing places</li>
          <li>Hierarchical relationships (Country → State → City)</li>
        </ul>
      </div>

      <div style={{ marginTop: "20px" }}>
        <p>For now, you can create a test place:</p>
        <Link 
          to="/$treeId/places/$placeId" 
          params={{ treeId, placeId: "test-place" }}
          style={{ 
            display: "inline-block",
            padding: "10px 20px", 
            backgroundColor: "#4CAF50", 
            color: "white", 
            textDecoration: "none"
          }}
        >
          View Test Place
        </Link>
      </div>
    </div>
  );
}

export default PlacesPage;