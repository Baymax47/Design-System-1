async function testAI() {
  const btn = document.getElementById('test-btn');
  const output = document.getElementById('output');
  const aiStatus = document.getElementById('ai-status');

  btn.disabled = true;
  btn.textContent = 'Testing...';
  output.classList.remove('hidden');
  output.textContent = 'Sending test message to OpenRouter...';

  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [{ role: 'user', content: 'Say "Hello! OpenRouter is connected." and nothing else.' }]
      })
    });

    const data = await res.json();

    if (data.choices && data.choices[0]) {
      const reply = data.choices[0].message.content;
      output.textContent = `✅ AI Response:\n${reply}`;
      output.style.color = 'var(--green)';
      aiStatus.querySelector('strong').textContent = 'Connected';
      aiStatus.querySelector('.dot').classList.remove('error');
    } else {
      throw new Error(JSON.stringify(data, null, 2));
    }
  } catch (err) {
    output.textContent = `❌ Error:\n${err.message}`;
    output.style.color = 'var(--red)';
    aiStatus.querySelector('strong').textContent = 'Error';
    aiStatus.querySelector('.dot').classList.add('error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Test AI Connection';
  }
}
