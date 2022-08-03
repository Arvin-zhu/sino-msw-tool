import React, { useEffect } from 'react';

export const App = () => {
	useEffect(() => {
		fetch('http://localhost:8002/getFruitList').then(res => res.json()).then(res => {
			console.log('===list', res)
		}).catch(e => {
			console.log('===fetch=error', e)
		})
	}, [])
	return <div>msw-ui</div>
}
