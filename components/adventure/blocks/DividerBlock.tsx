export default function DividerBlock() {
  return (
    <div className="my-8 flex items-center gap-4">
      <div className="flex-1 h-px bg-gray-200" />
      <div className="flex gap-1.5">
        <span className="w-1 h-1 rounded-full bg-gray-300" />
        <span className="w-1 h-1 rounded-full bg-gray-300" />
        <span className="w-1 h-1 rounded-full bg-gray-300" />
      </div>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}
