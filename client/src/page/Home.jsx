import HeroSection from "../component/Home/HeroSection.jsx";
import DoctorCard from "../component/Home/DoctorCardSm.jsx";
import ProductCard from "../component/Common/PoductCard.jsx";
import DepartmentCard from "../component/Common/DepartmentCard.jsx";
import BlogCard from "../component/Common/BlogCard.jsx";

import { FaVideo } from "react-icons/fa";

const Home = () => {
    return (
        <div className="bg-gray-100">

            {/* Hero Section */}
            <HeroSection/>

            {/* Info Cards Section */}
            <div className="relative">
                <section className="absolute -top-35 left-1/2 transform -translate-x-1/2 w-full px-6">
                    <div className={"grid grid-cols-1 md:grid-cols-3 gap-6 px-28 py-10"}>
                        <div
                            className="max-w-sm bg-gradient-to-r from-teal-400 to-teal-600 text-white p-6 rounded-lg shadow-lg relative">
                            <p className="text-sm opacity-80">Donec luctus</p>
                            <h2 className="text-xl font-bold mt-1">Opening Hours</h2>

                            <ul className="mt-4 space-y-2 text-sm">
                                <li className="flex justify-between">
                                    <span>• Monday - Friday</span>
                                    <span>8.00 - 20.00</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>• Saturday</span>
                                    <span>9.00 - 18.30</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>• Monday - Thursday</span>
                                    <span>9.00 - 15.00</span>
                                </li>
                            </ul>

                            <div
                                className="mt-6 text-sm font-semibold flex items-center space-x-2 cursor-pointer hover:underline">
                                <span>LEARN MORE</span>
                                <span>&rarr;</span>
                            </div>

                            {/* Clock Icon in Background */}
                            <div className="absolute bottom-4 right-4 opacity-20">
                                <img src="./watch.svg" alt="Watch"/>
                            </div>
                        </div>
                        <div
                            className="max-w-sm bg-gradient-to-r from-teal-400 to-teal-600 text-white p-6 rounded-lg shadow-lg relative">
                            <p className="text-sm opacity-80">Donec luctus</p>
                            <h2 className="text-xl font-bold mt-1">Opening Hours</h2>

                            <ul className="mt-4 space-y-2 text-sm">
                                <li className="flex justify-between">
                                    <span>• Monday - Friday</span>
                                    <span>8.00 - 20.00</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>• Saturday</span>
                                    <span>9.00 - 18.30</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>• Monday - Thursday</span>
                                    <span>9.00 - 15.00</span>
                                </li>
                            </ul>

                            <div
                                className="mt-6 text-sm font-semibold flex items-center space-x-2 cursor-pointer hover:underline">
                                <span>LEARN MORE</span>
                                <span>&rarr;</span>
                            </div>

                            {/* Clock Icon in Background */}
                            <div className="absolute bottom-4 right-4 opacity-20">
                                <img src="./Record.png" alt="Watch"/>
                            </div>
                        </div>
                        <div
                            className="max-w-sm bg-gradient-to-r from-teal-400 to-teal-600 text-white p-6 rounded-lg shadow-lg relative">
                            <p className="text-sm opacity-80">Donec luctus</p>
                            <h2 className="text-xl font-bold mt-1">Opening Hours</h2>

                            <ul className="mt-4 space-y-2 text-sm">
                                <li className="flex justify-between">
                                    <span>• Monday - Friday</span>
                                    <span>8.00 - 20.00</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>• Saturday</span>
                                    <span>9.00 - 18.30</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>• Monday - Thursday</span>
                                    <span>9.00 - 15.00</span>
                                </li>
                            </ul>

                            <div
                                className="mt-6 text-sm font-semibold flex items-center space-x-2 cursor-pointer hover:underline">
                                <span>LEARN MORE</span>
                                <span>&rarr;</span>
                            </div>

                            {/* Clock Icon in Background */}
                            <div className="absolute bottom-4 right-4 opacity-20">
                                <img src="./watch.svg" alt="Watch"/>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <section className="container text-center py-20 bg-gray mt-36 px-32">
                {/* Title */}
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    We Are Always Ready To Help You & Your Family
                </h2>

                {/* Subtitle */}
                <div className="flex justify-center items-center my-3">
                    <img src={"./arrowdot.png"} alt={"arrow"}/>
                </div>

                <p className="text-gray-600 max-w-lg mx-auto">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit praesent aliquet, pretium.
                </p>

                {/* Services */}
                <div className="mt-10 flex flex-col md:flex-row justify-center items-center gap-4 px-8">
                    {/* Emergency Help */}
                    <div className="text-center">
                        <div
                            className="w-20 h-20 border-2 border-gray-700 rounded-full flex items-center justify-center mx-auto">
                            <img src={"./ambulance.svg"} alt={"arrow"}/>
                        </div>
                        <h3 className="mt-3 text-lg font-semibold text-gray-900">Emergency Help</h3>
                        <p className="text-gray-600 text-sm">
                            Lorem ipsum sit, consectetur adipiscing elit. Maecenas mi quam vulputate.
                        </p>
                    </div>

                    <div className="w-40 pb-20">
                        <span className="mx-2 text-teal-500 font-bold">--------------</span>
                    </div>

                    {/* Enriched Pharmacy */}
                    <div className="text-center">
                        <div
                            className="w-20 h-20 border-2 border-gray-700 rounded-full flex items-center justify-center mx-auto">
                            <img src={"./pharmacy.svg"} alt={"arrow"}/>
                        </div>
                        <h3 className="mt-3 text-lg font-semibold text-gray-900">Enriched Pharmacy</h3>
                        <p className="text-gray-600 text-sm">
                            Lorem ipsum sit, consectetur adipiscing elit. Maecenas mi quam vulputate.
                        </p>
                    </div>

                    <div className="w-40 pb-20">
                        <span className="mx-2 text-teal-500 font-bold">--------------</span>
                    </div>

                    {/* Medical Treatment */}
                    <div className="text-center">
                        <div
                            className="w-20 h-20 border-2 border-gray-700 rounded-full flex items-center justify-center mx-auto">
                            <img src={"./medical.svg"} alt={"arrow"}/>
                        </div>
                        <h3 className="mt-3 text-lg font-semibold text-gray-900">Medical Treatment</h3>
                        <p className="text-gray-600 text-sm">
                            Lorem ipsum sit, consectetur adipiscing elit. Maecenas mi quam vulputate.
                        </p>
                    </div>
                </div>
            </section>

            {/* Specialist Doctors */}
            <section className="bg-cover bg-center py-16 text-center px-28"
                     style={{backgroundImage: "url('/doctorbg.png')"}}>
                <div className="py-12">
                    <h2 className="text-3xl text-white font-semibold">We Have Specialist Doctors to Solve Your
                        Problems</h2>
                    {/* Subtitle */}
                    <div className="flex justify-center items-center my-3">
                        <img src={"./arrowhite.png"} alt={"arrow"}/>
                    </div>

                    <p className="text-white max-w-lg mx-auto">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit praesent aliquet, pretium.
                    </p>
                    <div className="flex flex-wrap justify-center gap-6 mt-6">
                        <DoctorCard
                            image="/doctor.png"
                            name="Collis Molate"
                            specialty="Neurosurgeon"
                        />
                        <DoctorCard
                            image="/doctor.png"
                            name="Collis Molate"
                            specialty="Neurosurgeon"
                        />
                        <DoctorCard
                            image="/doctor.png"
                            name="Collis Molate"
                            specialty="Neurosurgeon"
                        />
                        <DoctorCard
                            image="/doctor.png"
                            name="Collis Molate"
                            specialty="Neurosurgeon"
                        />
                    </div>
                </div>
            </section>


            {/* Featured Products */}
            <section className="py-16 text-center bg-gray-100 px-32 ">
                <h2 className="text-2xl font-semibold">Featured Products</h2>
                <div className="flex flex-wrap justify-center gap-6 mt-6">
                    <ProductCard
                        image="/product01.png"
                        name="Cannabis Opioid"
                        price="39.00"
                        isHot={true}
                    />
                    <ProductCard
                        image="/product01.png"
                        name="Cannabis Opioid"
                        price="39.00"
                        isHot={true}
                    />
                    <ProductCard
                        image="/product01.png"
                        name="Cannabis Opioid"
                        price="39.00"
                        isHot={true}
                    />
                    <ProductCard
                        image="/product01.png"
                        name="Cannabis Opioid"
                        price="39.00"
                        isHot={true}
                    />
                </div>
            </section>

            {/* Hospital Departments */}
            <section className="py-16 text-center bg-white px-32">
                {/* Title */}
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Hospital Department
                </h2>

                <p className="text-gray-600 max-w-lg mx-auto my-3">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit praesent aliquet, pretium.
                </p>

                {/* Subtitle */}
                <div className="flex justify-center items-center my-3">
                    <img src={"./line.png"} alt={"arrow"}/>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-10 mt-6">
                    <DepartmentCard
                        icon="/oncology_icon.svg"
                        title="Oncology"
                        category="Cancer & Tumors"
                        description="Behind the word mountains, far from the countries Vokalia and Consonantia"
                    />
                    <DepartmentCard
                        icon="/oncology_icon.svg"
                        title="Oncology"
                        category="Cancer & Tumors"
                        description="Behind the word mountains, far from the countries Vokalia and Consonantia"
                    />
                    <DepartmentCard
                        icon="/oncology_icon.svg"
                        title="Oncology"
                        category="Cancer & Tumors"
                        description="Behind the word mountains, far from the countries Vokalia and Consonantia"
                    />
                    <DepartmentCard
                        icon="/oncology_icon.svg"
                        title="Oncology"
                        category="Cancer & Tumors"
                        description="Behind the word mountains, far from the countries Vokalia and Consonantia"
                    />
                    <DepartmentCard
                        icon="/oncology_icon.svg"
                        title="Oncology"
                        category="Cancer & Tumors"
                        description="Behind the word mountains, far from the countries Vokalia and Consonantia"
                    />
                    <DepartmentCard
                        icon="/oncology_icon.svg"
                        title="Oncology"
                        category="Cancer & Tumors"
                        description="Behind the word mountains, far from the countries Vokalia and Consonantia"
                    />
                    <DepartmentCard
                        icon="/oncology_icon.svg"
                        title="Oncology"
                        category="Cancer & Tumors"
                        description="Behind the word mountains, far from the countries Vokalia and Consonantia"
                    />
                    <DepartmentCard
                        icon="/oncology_icon.svg"
                        title="Oncology"
                        category="Cancer & Tumors"
                        description="Behind the word mountains, far from the countries Vokalia and Consonantia"
                    />

                </div>
            </section>

            {/* Online Consultations */}
            <section className="relative bg-cover bg-center py-32"
                     style={{backgroundImage: "url('/VCBg.png')"}}>
                <div className="container mx-auto flex flex-col lg:flex-row items-center justify-end px-6 lg:px-16">

                    {/* Right Side - Text Content */}
                    <div className="w-full lg:w-1/2 text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-gray-900">Get Online Consultations</h2>
                        <p className="text-gray-600 mt-3 w-2/3">
                            Behind the word mountains, far from the countries Vokalia and Consonantia, there live the
                            blind texts.
                        </p>

                        {/* Button */}
                        <button
                            className="mt-5 flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 px-6 rounded-lg transition">
                            START VIDEO CHAT <FaVideo/>
                        </button>
                    </div>
                </div>
            </section>

            {/* Blog Section */}
            <section className="py-16 text-center bg-white px-28">
                {/* Title */}
                <h2 className="text-2xl md:text-3xl font-bold text-teal-600">
                    Our Blog
                </h2>

                <p className="text-gray-600 max-w-lg mx-auto my-3">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit praesent aliquet, pretium.
                </p>

                <div className="flex flex-wrap justify-center gap-8 mt-6">
                    <BlogCard
                        image="/blog01.png"
                        author="Shawn Jackson"
                        date="12 Sep, 2020"
                        title="10 Outrageous ideas for your medical products"
                        description="The medical products industry is a diverse, imaginative, and dynamic area."
                    />
                    <BlogCard
                        image="/blog01.png"
                        author="Shawn Jackson"
                        date="12 Sep, 2020"
                        title="10 Outrageous ideas for your medical products"
                        description="The medical products industry is a diverse, imaginative, and dynamic area."
                    />
                    <BlogCard
                        image="/blog01.png"
                        author="Shawn Jackson"
                        date="12 Sep, 2020"
                        title="10 Outrageous ideas for your medical products"
                        description="The medical products industry is a diverse, imaginative, and dynamic area."
                    />

                </div>
            </section>
        </div>
    );
};

export default Home;
