/** Inline error message banner used across forms. */

type Props = { message: string | null };

export default function ErrorBanner({ message }: Props) {
  if (!message) return null;

  return (
    <div
      style={{
        background: "#fef2f2",
        color: "#b91c1c",
        padding: 10,
        borderRadius: 8,
        marginBottom: 12,
        fontSize: 14
      }}
    >
      {message}
    </div>
  );
}
