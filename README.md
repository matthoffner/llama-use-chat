# llama-use-chat

Example of using Vercel's `useChat` with Llama.cpp /completion route. Handles formatting the data to match the OpenAI spec along with the ability to configure Llama.cpp parameters.

```
npm install
```

```
LLAMA_SERVER_URL=https://huggingface.co/spaces/matthoffner/ggml-coding-cpu/completions npm run dev
```

`LLAMA_SERVER_URL` defaults to `http://127.0.0.1:8080/completion`