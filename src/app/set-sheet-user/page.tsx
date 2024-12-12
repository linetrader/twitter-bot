import GetSheetUsers from "@/components/GetSheetUsers";
import SetSheetFormUsers from "@/components/SetSheetFormUsers";

export default function SetGoogleSheet() {
  return (
    <div>
      <SetSheetFormUsers />
      <GetSheetUsers />
    </div>
  );
}
