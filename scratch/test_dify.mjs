import fs from 'fs';

async function testDify() {
  const difyUrl = 'https://api.dify.ai/v1';
  const apiKey = 'app-lOGiBqt5WCmoxmKy8jOQU6zA';

  const imageBuffer = fs.readFileSync('public/icon.png');
  const blob = new Blob([imageBuffer], { type: 'image/png' });

  const formData = new FormData();
  formData.append("file", blob, "image.png");
  formData.append("user", "test-script");

  const uploadRes = await fetch(`${difyUrl}/files/upload`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}` },
    body: formData
  });

  const uploadData = await uploadRes.json();
  const fileId = uploadData.id;

  const res = await fetch(`${difyUrl}/workflows/run`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      inputs: {
        image: {
          transfer_method: "local_file",
          upload_file_id: fileId,
          type: "image"
        }
      },
      response_mode: 'blocking',
      user: 'test-script'
    })
  });

  const data = await res.json();
  console.log("BLOCKING RESULT:", JSON.stringify(data, null, 2));
}

testDify().catch(console.error);
