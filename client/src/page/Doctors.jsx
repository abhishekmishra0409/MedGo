import React from 'react';
import DepartmentCardLr from "../component/Doctors/DepartmentCardLr.jsx";

function Doctors() {
    return (
        <>
            <DepartmentCardLr
                icon="/oncology_icon.svg"
                title="Oncology"
                category="Cancer & Tumors"
                description="Behind the word mountains, far from the countries Vokalia and Consonantia"
            />
        </>
    );
}

export default Doctors;