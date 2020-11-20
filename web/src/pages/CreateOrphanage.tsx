import React, { useState, FormEvent, ChangeEvent } from "react";

import { Map, Marker, TileLayer } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import { FiPlus, FiX } from "react-icons/fi";
import api from "../services/api";
import { useHistory } from 'react-router-dom';

import '../styles/pages/create-orphanage.css';

import Sidebar from "../components/Sidebar";

import mapIcon from "../utils/mapIcon";

export default function CreateOrphanage() {
    const [position, setPosition] = useState({ latitude: 0, longitude: 0 });
    const history = useHistory();

    const [name, setName] = useState('');
    const [about, setabout] = useState('');
    const [instructions, setInstructions] = useState('');
    const [opening_hours, setOpeningHours] = useState('');
    const [open_on_weekends, setOpenOnWeekends] = useState(true);
    const [images, setImages] = useState<File[]>([]);
    const [previewImages, setPreviewImages] = useState<string[]>([]);

    function handleMapClick(event: LeafletMouseEvent) {
        const { lat, lng } = event.latlng;
        setPosition({
            latitude: lat,
            longitude: lng
        });
    }

    function handleSelectImages(event: ChangeEvent<HTMLInputElement>) {
        if(!event.target.files) {
            return;
        }

        const selectedImages = Array.from(event.target.files);

        setImages(images.concat(selectedImages));

        const selectedImagesPreview = selectedImages.map(image => {
            return URL.createObjectURL(image);
        });

        setPreviewImages(previewImages.concat(selectedImagesPreview));
        
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();

        const { latitude, longitude } = position;

        if(latitude===0||longitude===0) {
            alert('Necessário colocar um local no mapa!');

            return;
        }

        const data = new FormData();

        data.append('name', name);
        data.append('about', about);
        data.append('latitude', String(latitude));
        data.append('longitude', String(longitude));
        data.append('instructions', instructions);
        data.append('opening_hours', opening_hours);
        data.append('open_on_weekends', String(open_on_weekends));
        
        images.forEach(image => {
            data.append('images', image);
        });

        await api.post('orphanages', data);

        alert('Cadastro realizado com sucesso!');

        history.push('/app');
    }

    function handleDeleteImage() {
        // NOT WORKING
    }

    return (
        <div id="page-create-orphanage">
            <Sidebar />

            <main>
                <form onSubmit={handleSubmit} className="create-orphanage-form">
                    <fieldset>
                        <legend>Dados</legend>

                        <Map
                            center={[-23.5117412,-47.4409751]}
                            style={{ width: '100%', height: 280 }}
                            zoom={15}
                            onClick={handleMapClick}
                        >
                            <TileLayer url="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                            { position.latitude !== 0 && (
                                <Marker 
                                    interactive={false} 
                                    icon={mapIcon} p
                                    position={[position.latitude, position.longitude]} 
                                /> 
                            )}
                        </Map>

                        <div className="input-block">
                            <label htmlFor="name">Nome</label>
                            <input 
                                id="name"
                                value={name}
                                onChange={event => setName(event.target.value)}    
                            />
                        </div>

                        <div className="input-block">
                            <label htmlFor="about">Sobre <span>Máximo de 300 caracteres</span></label>
                            <textarea 
                                id="name" 
                                maxLength={300} 
                                value={about}
                                onChange={event => setabout(event.target.value)}
                            />
                        </div>

                        <div className="input-block">
                            <label htmlFor="images">Fotos</label>

                            <div className="images-container">
                                {previewImages.map((image, index) => {
                                    return (
                                        <div key={image} className="image-preview">
                                            <img src={image} alt={name} />
                                            <div onClick={handleDeleteImage} className="icon-close"> {/* DELETE IS NOT WORKING */}
                                                <FiX size={20} color="#FF669E" />
                                            </div>
                                        </div>
                                    )
                                })}

                                <label htmlFor="image[]" className="new-image">
                                    <FiPlus size={24} color="#15b6d6" />
                                </label>
                            </div>

                            <input multiple onChange={handleSelectImages} type="file" id="image[]"/>
                        </div>
                    </fieldset>

                    <fieldset>
                        <legend>Visitação</legend>

                        <div className="input-block">
                            <label htmlFor="instructions">Instruções</label>
                            <textarea 
                                id="instructions"
                                value={instructions}
                                onChange={event => setInstructions(event.target.value)} 
                            />
                        </div>

                        <div className="input-block">
                            <label htmlFor="opening_hours">Horário de funcionamento</label>
                            <input
                                placeholder="Ex: Das 9h as 18h"
                                id="opening_hours"
                                value={opening_hours}
                                onChange={event => setOpeningHours(event.target.value)}
                            />
                        </div>

                        <div className="input-block">
                            <label htmlFor="open_on_weekends">Atende fim de semana</label>

                            <div className="button-select">
                                <button 
                                    type="button" 
                                    className={open_on_weekends ? 'active' : ''}
                                    onClick={() => setOpenOnWeekends(true)}
                                >
                                    Sim
                                </button>
                                <button 
                                    type="button"
                                    className={!open_on_weekends ? 'active' : ''}
                                    onClick={() => setOpenOnWeekends(false)}
                                >
                                    Não
                                </button>
                            </div>
                        </div>
                    </fieldset>

                    <button className="confirm-button" type="submit">
                        Confirmar
                    </button>
                </form>
            </main>
        </div>
    );
}
