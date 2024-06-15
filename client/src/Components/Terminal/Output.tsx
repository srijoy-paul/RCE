const INSTANCE_URI = "http://localhost:3000";

function Output() {
  return (
    <div className="bg-white w-full border-2 border-red-100">
      <iframe className="h-full w-full" src={INSTANCE_URI} />
    </div>
  );
}

export default Output;
