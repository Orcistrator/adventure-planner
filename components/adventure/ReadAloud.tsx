interface ReadAloudProps {
  text: string;
}

export default function ReadAloud({ text }: ReadAloudProps) {
  return (
    <div className="my-6">
      <div className="read-aloud shadow-sm">
        <p>{text}</p>
      </div>
    </div>
  );
}
