import * as esbuild from 'esbuild-wasm';
import { useRef } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import ReactDOM from 'react-dom';

const App = () => {
	const initializedRef = useRef<any>();

	const example = "const b = { ...{ color: 'red'}};";
	// const example = 'const App = () => <div><h1>Hello</h1><p>fgdfgdf</p></div>;';
	const [input, setInput] = useState(example);
	const [code, setCode] = useState('');
	const [messages, setMessages] = useState('');

	const startService = async () => {
		// ref.current = await esbuild.initialize({
		await esbuild.initialize({
			worker: true,
			wasmURL: '/esbuild.wasm',
		});

		initializedRef.current = true;
	};

	useEffect(() => {
		startService();
	}, []);

	const onClick = async () => {
		if (!initializedRef.current) {
			return;
		}

		setMessages('');
		try {
			// setCode(ref.current.transformSync(input).code);
			const res = await esbuild.transform(input, {
				loader: 'ts',
				target: 'es2015',
			});

			// console.log(res);

			if (res.warnings.length) {
				setMessages(res.warnings.join(', '));
			} else {
				setCode(res.code);
			}
		} catch (error) {
			setMessages(error.message);
		}
	};

	return (
		<div>
			<textarea rows={5} cols={100} value={input} onChange={(e) => setInput(e.target.value)}></textarea>
			<div>
				<button onClick={onClick}>Submit</button>
			</div>
			{messages.length > 0 && (
				<div className="messages" style={{ color: 'red', padding: 10, border: '1px solid red', margin: '5px 0' }}>
					{messages}
				</div>
			)}
			<pre>{code}</pre>
		</div>
	);
};

ReactDOM.render(<App />, document.querySelector('#root'));
