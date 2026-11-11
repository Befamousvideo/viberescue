export function AddressImg({ variant }) {
  const ads = variant === "ads";
  return (
    <img
      className="addr-img"
      src={ads ? "/images/email-ads.png" : "/images/email-support.png"}
      alt={ads ? "Advertising email address" : "Support email address"}
      width={ads ? 165 : 196}
      height={22}
      decoding="async"
    />
  );
}
