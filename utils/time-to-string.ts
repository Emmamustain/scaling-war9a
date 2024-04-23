export default function ConvertTimeToString(seconds: number) {
  let ornament = "sec";
  let string = "Inf";

  if (seconds < 60) {
    string = seconds + " " + ornament;
  } else if (seconds >= 60 && seconds < 3600) {
    ornament = "min";
    string = Math.ceil(seconds / 60) + " " + ornament;
  } else if (seconds >= 3600 && seconds < 36000) {
    ornament = "hour";
    string = Math.round(seconds / 3600) + " " + ornament;
  }

  return string;
}
