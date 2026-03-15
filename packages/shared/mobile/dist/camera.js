import { isNative } from "./platform";
/**
 * Capture a photo from the device camera or prompt file picker on web.
 */
export async function takePhoto() {
    if (isNative()) {
        const { Camera, CameraResultType, CameraSource } = await import("@capacitor/camera");
        const photo = await Camera.getPhoto({
            quality: 80,
            resultType: CameraResultType.DataUrl,
            source: CameraSource.Prompt,
        });
        if (!photo.dataUrl)
            return null;
        return {
            dataUrl: photo.dataUrl,
            format: photo.format,
        };
    }
    return new Promise((resolve) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = () => {
            const file = input.files?.[0];
            if (!file) {
                resolve(null);
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result;
                if (typeof result === "string") {
                    resolve({ dataUrl: result, format: file.type.split("/")[1] ?? "jpeg" });
                }
                else {
                    resolve(null);
                }
            };
            reader.readAsDataURL(file);
        };
        input.click();
    });
}
//# sourceMappingURL=camera.js.map