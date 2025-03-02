import { Button } from "./components/ui/button";
import { useIndividuals } from "./lib/hooks";

function App() {
  const { data, isLoading, error } = useIndividuals();

  console.log({ data, isLoading, error });

  return (
    <div>
      <Button>Click me</Button>
    </div>
  );
}

export default App;
