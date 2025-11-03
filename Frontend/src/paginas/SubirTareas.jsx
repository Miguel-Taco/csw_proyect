import { useState } from "react";

import "../styles/SubirTareas.css";

const descripcionDemo = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor mauris molestie elit, et lacinia ipsum quam nec dui.";

function SubirTareas() {
	const [link, setLink] = useState("");

	return (
		<div className="subirTareas-body">
			<div className="subirTareas-overlay">
				<div className="subirTareas-modal">
					<header className="subirTareas-header">
						<h1>ARCHIVOS O LINKS</h1>
						<button className="subirTareas-upload">Subir</button>
					</header>
					<div className="subirTareas-content">
						<section className="subirTareas-panel">
							<p className="subirTareas-helper">
								Pega el enlace de tu documento directamente en el cuadro de abajo.
							</p>
							<input
								type="text"
								className="subirTareas-link"
								value={link}
								onChange={(event) => setLink(event.target.value)}
								placeholder="Ejemplo: https://docs.google.com/..."
							/>
						</section>
						<aside className="subirTareas-description">
							<h2>Descripción</h2>
							<p>{descripcionDemo}</p>
						</aside>
					</div>
				</div>
			</div>
		</div>
	);
}

export default SubirTareas;
