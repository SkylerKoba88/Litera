//this is where we would write the frontend for profile
// ---- also where we would likely require having logged in + fetched specific user data
import Abstract from "./Abstract";
import ImageKit from "imagekit-javascript";

export default class Profile extends Abstract {
    async getHtml(): Promise<string> {
        this.setTitle('Profile');
        // page html
        return `
            <img src="">
            <button>test image set</button>
        `;
    }

    //test image fetch and upload
    async afterRender(): Promise<void> {
        // set test variables
        const avatar = document.getElementById("avatar") as HTMLImageElement | null;
        const btnTest = document.getElementById("btnTestImage") as HTMLButtonElement | null;
        const fileInput = document.getElementById("fileInput") as HTMLInputElement | null;
        const btnUpload = document.getElementById("btnUpload") as HTMLButtonElement | null;
        const dropZone = document.getElementById("dropZone") as HTMLDivElement | null;
        const statusEl = document.getElementById("status") as HTMLDivElement | null;
        const urlEl = document.getElementById("imageUrl") as HTMLInputElement | null;

        let selectedFile: File | null = null;

        const setStatus = (msg: string) => {
            if (statusEl) statusEl.textContent = msg;
        };

        // function SetImage
        const setImage = (url:string) => {
            if (avatar) avatar.src = url;
            if (urlEl) urlEl.src = url;
        }

        // test image set
        btnTest?.addEventListener("click", () => {
            const testUrl="https://ik.imagekit.io/kjonesLitera/Disco.png?updatedAt=1771898369768"
            setImage(testUrl);
        })

        // test file selection
        fileInput?.addEventListener("change", (e) => {
            const files = (e.target as HTMLInputElement).files;
            if (files && files[0]) {
                selectedFile = files[0];
                //preview
                const previewUrl = URL.createObjectURL(selectedFile);
                setImage(previewUrl);
                setStatus(`Selected: ${selectedFile.name} (${Math.round(selectedFile.size / 1024)} KB)`);
            }
        });

        // test drag and drop
        if (dropZone) {
            ["dragenter", "dragover"].forEach((evt) =>
                dropZone.addEventListener(evt, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dropZone.style.borderColor = "#4f46e5";
                })
            );
            ["dragleave", "drop"].forEach((evt) =>
                dropZone.addEventListener(evt, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dropZone.style.borderColor = "#cbd5e1";
                })
            );
            
            dropZone.addEventListener("drop", (e) => {
                const dt = (e as DragEvent).dataTransfer;
                if (dt && dt.files && dt.files[0]) {
                    selectedFile = dt.files[0];
                    const previewUrl = URL.createObjectURL(selectedFile);
                    setImage(previewUrl);
                    setStatus(`Selected (dropped): ${selectedFile.name}`);
                }
            });

        }

        // test upload to IK
        
        btnUpload?.addEventListener("click", async () => {
            if (!selectedFile) {
            setStatus("Please choose an image first.");
            return;
        }

        try {
            setStatus("Getting authentication…");
            const authRes = await fetch("/api/imagekit/auth", { method: "GET" });
            if (!authRes.ok) {
                throw new Error(`Auth failed: ${authRes.status}`);
            }
            const { signature, expire, token, publicKey, urlEndpoint } = await authRes.json();
            /*const imagekit = new ImageKit({
                publicKey, urlEndpoint, authenticationEndpoint: "/api/imagekit/auth"
            });
            setStatus("Uploading to ImageKit…");

            const fileName = `profile_${Date.now()}.jpg`
            
            //fix with what is correct in imagekit.ts
            const result = await imagekit.upload({
                file: selectedFile,
                fileName,
            });

            
            setImage(result.url);
            setStatus("Upload complete!");*/

        } catch (e) {
            console.log(e);
            setStatus(`Upload error: ${e}`);
        }
        });
    }
}

