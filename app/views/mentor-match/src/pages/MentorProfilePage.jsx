import { useState, useEffect } from "react"
import CreatableSelect from "react-select/creatable";
import { useSelector, useDispatch } from "react-redux";
import { addNewSkill, getAllSkills } from "../redux/slices/skillsSlice";
import { mentorProfile, updateMentor, updateMentorProfilePic } from "../redux/slices/mentorSlice";
import { useParams } from "react-router-dom";
import { format } from "date-fns"
import { toast } from "react-toastify";
import isURL from "validator/lib/isURL";

/* const initialState = {
    profilePic: '',
    availability: '',
    skills: [],
    spokenLanguages: '',
    companyName: '',
    jobTitle: '',
    linkedIn: '',
    personalWebsite: '',
    phoneNumber: '',
    about: '',
    bio: '',
    location: '',
    pricing: {
        basic: {
            amount: '',
            sessionDuration: '',
            call: '',
            videoCall: '',
            features: ''
        },
        pro: {
            amount: '',
            sessionDuration: '',
            call: '',
            videoCall: '',
            features: ''
        }
    }
} */

export default function MentorProfilePage({ data }) {

    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({})
    const [selectedSkills, setSelectedSkills] = useState([])
    const { data: skills } = useSelector((state) => state.skills)
    const [clientErrors, setClientErrors] = useState(null)
    const errors = {}

    const dispatch = useDispatch()
    const { id } = useParams()

    const runClientValidation = () => {
        if (form.companyName.trim().length === 0) {
            errors.companyName = 'Company name required'
        }
        if (form.jobTitle.trim().length === 0) {
            errors.jobTitle = 'Job title'
        }
        if (form.bio.trim().length === 0) {
            errors.bio = 'Bio required'
        }
        if (form.about.trim().length == 0) {
            errors.about = 'About Reqired'
        }
        if (form.location.trim().length === 0) {
            errors.location = 'Location required'
        }
        if (form.spokenLanguages.length === 0) {
            errors.spokenLanguages = 'Languages required'
        }
        if (form.skills.length === 0) {
            errors.skills = "skills required"
        }
        if (form.phoneNumber.length === 0) {
            errors.phoneNumber = "Phone number required"
        }
        if (form.linkedIn.trim().length === 0) {
            errors.linkedIn = 'LinkedIn required'
        } else if (!isURL(form.linkedIn)) {
            errors.linkedIn = 'URL should be in proper format'
        }
        if (form.personalWebsite.trim().length === 0) {
            errors.personalWebsite = "Personal website required"
        } else if (!isURL(form.personalWebsite)) {
            errors.personalWebsite = "URL should be in proper format"
        }
        if (!form.pricing || Object.keys(form.pricing).length === 0) {
            errors.pricing = 'Pricing required';
        } else {
            if (!form.pricing.basic?.amount) {
                errors.pricing = 'Basic plan amount required';
            }
            if (!form.pricing.pro?.amount) {
                errors.pricing = 'Pro plan amount required';
            }
        }
    }

    useEffect(() => {
        dispatch(mentorProfile({ id }))
    }, [dispatch, id])

    useEffect(() => {
        if (data && data.skills) {
            const prefilledSkills = data.skills.map(skill => ({
                value: skill._id,
                label: skill.skill,
            }));
            setSelectedSkills(prefilledSkills);
            setForm(prev => ({ ...prev, skills: prefilledSkills.map(s => s.value) }));
        }
    }, [data]);

    useEffect(() => {
        dispatch(getAllSkills())
    }, [dispatch])

    if (!data) {
        return <p>loading</p>
    }

    const handleChange = (selectedOption) => {
        setSelectedSkills(selectedOption)
        setForm({ ...form, skills: selectedOption.map(ele => ele.value) });
    }

    const handleCreateSkill = async (inputValue) => {
        const result = await dispatch(addNewSkill({ skill: inputValue }));
        if (result && result.payload) {
            const createdSkillOption = {
                value: result.payload._id,
                label: result.payload.skill,
            };
            setSelectedSkills([...selectedSkills, createdSkillOption]);
            setForm({
                ...form,
                skills: [...(form.skills || []), result.payload._id]
            });
        } else {
            console.error("Failed to add new skill");
        }
    };

    const handleClick = (data) => {
        setShowForm(true)
        setForm(data)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        runClientValidation()

        if (Object.keys(errors).length !== 0) {
            setClientErrors(errors)
        } else {
            try {
                dispatch(updateMentor({ userId: id, form }))
                toast.success('you have updated your profile.')
                setShowForm(false)
            } catch (err) {
                toast.error('error in updating profile')
                console.log(err)
            }
        }
    }

    const formatDate = (date) => {
        return format(date, "yyyy-MM-dd")
    }

    const handleRemove = (delId) => {
        const updatedExperiences = form.experiences.filter(exp => exp._id !== delId);
        const updatedForm = { ...form, experiences: updatedExperiences };
        setForm(updatedForm);
        dispatch(updateMentor({ userId: id, form: updatedForm }))
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("profilePic", file);

        dispatch(updateMentorProfilePic({ id: id, image: formData }));
    }

    return (
        <div>
            <div className="bg-cyan-900 w-full h-60">

                <img className="w-12 h-12 absolute right-6 top-87 cursor-pointer" src="/src/assets/a.png" onClick={() => { handleClick(data) }} />
                <div>
                    <div className="pb-20">
                        {data?.profilePic ? (
                            <img className=" border-4 border-white relative top-25 left-10 w-50 h-50 rounded-full" src={data?.profilePic} />
                        ) : (
                            <img className=" border-4 border-white relative top-25 left-10 w-50 h-50 rounded-full" src="\src\assets\user.png" />
                        )}
                        <p className="text-3xl font-semibold ps-10 pt-40">{data?.userId?.username}</p>
                        <p className="text-lg ps-10 mt-2">{data?.companyName}</p>
                        <p className="text-lg font-semibold ps-10 mt-2">{data?.jobTitle}</p>
                        <p className="text-lg text-green-600 font-medium ps-10 mt-2 mb-4">{data?.bio}</p>
                        <p className="text-lg ps-10 mb-8">{data?.location}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {data?.skills?.map((skill, index) => (
                                <span key={index} className=" bg-gray-200 mb-6 ml-10 text-gray-700 px-3 py-1 rounded-full text-lg">
                                    {skill.skill}
                                </span>
                            ))}
                        </div>

                        <hr />
                        <p className="text-3xl font-semibold ps-10 my-8">About</p>
                        <p className="text-lg ps-10 mb-10">{data?.about}</p>
                        <hr />

                        <div>
                            <div className="px-10 py-6">
                                <h2 className="text-3xl font-semibold mb-6">Experiences</h2>
                                {data?.experiences?.length > 0 ? (
                                    data.experiences.map((exp, i) => (
                                        <div key={i} className="p-6 mb-4 border border-gray-200 rounded-lg shadow-sm bg-white">
                                            <div className="flex flex-col md:flex-row md:justify-between">
                                                <div>
                                                    <p className="text-xl font-bold text-gray-800">{exp?.companyName}</p>
                                                    <p className="text-md text-gray-600 mt-1">{exp?.position}</p>
                                                </div>
                                                <div className="mt-4 md:mt-0 text-right">
                                                    <p className="text-sm text-gray-500">
                                                        {exp?.startingDate ? new Date(exp.startingDate).toLocaleDateString() : "N/A"}{" "}
                                                        -{" "}
                                                        {exp?.endingDate ? new Date(exp.endingDate).toLocaleDateString() : "Present"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-lg text-gray-500">No experiences available.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showForm && (
                <div className="fixed inset-0 flex justify-center items-center p-4">
                    <div className="bg-white p-6 rounded-lg shadow-2xl relative w-full max-w-3xl max-h-[90vh] overflow-y-auto scale-105 transition-transform duration-200">
                        <button
                            onClick={() => setShowForm(false)}
                            className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-2xl"
                        >
                            ✖
                        </button>

                        <h2 className="text-2xl font-semibold mb-4 text-center">Update Profile</h2>

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div className="relative">
                                {form?.profilePic ? (
                                    <img
                                        className="w-20 h-20 rounded-full object-cover border"
                                        src={typeof form.profilePic === "string" ? form.profilePic : URL.createObjectURL(form.profilePic)}
                                        alt="Profile"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-full border bg-gray-300 flex items-center justify-center">+
                                    </div>
                                )}

                                <input
                                    id="fileInput"
                                    className="absolute top-0 left-0 w-20 h-20 opacity-0 cursor-pointer"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>

                            {/* <img className="w-10 h-10 absolute top-30 left-20"
                                src="\src\assets\upload.png" /> */}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input className="w-full border border-gray-300 p-2 rounded" type="text" placeholder="Company Name"
                                    value={form?.companyName}
                                    onChange={(e) => { setForm({ ...form, companyName: e.target.value }) }} />
                                {clientErrors && <p className="text-sm text-red-500 mt-1">{clientErrors.companyName}</p>}

                                <input className="w-full border border-gray-300 p-2 rounded" type="text" placeholder="Job Title"
                                    value={form?.jobTitle} onChange={(e) => { setForm({ ...form, jobTitle: e.target.value }) }} />
                                {clientErrors && <p className="text-sm text-red-500 mt-1">{clientErrors.jobTitle}</p>}

                            </div>

                            <input className="w-full border border-gray-300 p-2 rounded" type="text" placeholder="Bio"
                                value={form?.bio} onChange={(e) => { setForm({ ...form, bio: e.target.value }) }} />
                            {clientErrors && <p className="text-sm text-red-500 mt-1">{clientErrors.bio}</p>}

                            <input className="w-full border border-gray-300 p-2 rounded" type="text" placeholder="About"
                                value={form?.about} onChange={(e) => { setForm({ ...form, about: e.target.value }) }} />
                            {clientErrors && <p className="text-sm text-red-500 mt-1">{clientErrors.about}</p>}


                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input className="w-full border border-gray-300 p-2 rounded" type="text" placeholder="Location"
                                    value={form?.location} onChange={(e) => { setForm({ ...form, location: e.target.value }) }} />
                                {clientErrors && <p className="text-sm text-red-500 mt-1">{clientErrors.location}</p>}


                                <input className="w-full border border-gray-300 p-2 rounded" type="text" placeholder="Spoken Languages" value={form?.spokenLanguages} onChange={(e) => { setForm({ ...form, spokenLanguages: e.target.value }) }} />
                                {clientErrors && <p className="text-sm text-red-500 mt-1">{clientErrors.spokenLanguages}</p>}

                            </div>

                            <CreatableSelect
                                isMulti
                                options={skills?.map(ele => ({ value: ele._id, label: ele.skill }))}
                                value={selectedSkills}
                                onChange={handleChange}
                                onCreateOption={handleCreateSkill}
                                isClearable={true}
                                placeholder="Select or add skills"
                            />
                            {clientErrors && <p className="text-sm text-red-500 mt-1">{clientErrors.skills}</p>}


                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input className="w-full border border-gray-300 p-2 rounded" type="text" placeholder="Phone Number" value={form?.phoneNumber} onChange={(e) => { setForm({ ...form, phoneNumber: e.target.value }) }} />
                                <select className="w-full border border-gray-300 p-2 rounded" value={form?.availability} onChange={(e) => { setForm({ ...form, availability: e.target.value }) }}>
                                    <option disabled>Availability</option>
                                    <option value="available">Available</option>
                                    <option value="notAvailable">Not Available</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input className="w-full border border-gray-300 p-2 rounded" type="text" placeholder="LinkedIn" value={form?.linkedIn} onChange={(e) => { setForm({ ...form, linkedIn: e.target.value }) }} />
                                {clientErrors && <p className="text-sm text-red-500 mt-1">{clientErrors.linkedIn}</p>}

                                <input className="w-full border border-gray-300 p-2 rounded" type="text" placeholder="Personal Website" value={form?.personalWebsite} onChange={(e) => { setForm({ ...form, personalWebsite: e.target.value }) }} />
                                {clientErrors && <p className="text-sm text-red-500 mt-1">{clientErrors.personalWebsite}</p>}

                            </div>


                            {/* experience form */}
                            <div className="flex flex-col space-y-2">
                                {form?.experiences?.map((ele, index) => (
                                    <div key={index} className="flex space-x-4 items-center">
                                        <input
                                            className="border border-gray-400 rounded w-30"
                                            placeholder="Starting Date"
                                            type="date"
                                            value={ele?.startingDate ? formatDate(ele.startingDate) : ""}
                                            onChange={(e) => {
                                                const updatedExperiences = form.experiences.map((exp, i) =>
                                                    i === index ? { ...exp, startingDate: e.target.value } : exp
                                                );
                                                setForm({ ...form, experiences: updatedExperiences });
                                            }}
                                        />

                                        <input
                                            className="border border-gray-400 rounded w-30"
                                            placeholder="Ending Date"
                                            type="date"
                                            value={ele?.endingDate ? formatDate(ele.endingDate) : ""}
                                            onChange={(e) => {
                                                const updatedExperiences = form.experiences.map((exp, i) =>
                                                    i === index ? { ...exp, endingDate: e.target.value } : exp
                                                );
                                                setForm({ ...form, experiences: updatedExperiences });
                                            }}
                                        />

                                        <input
                                            className="border border-gray-400 rounded w-40"
                                            placeholder="Company Name"
                                            type="text"
                                            value={ele?.companyName || ""}
                                            onChange={(e) => {
                                                const updatedExperiences = form.experiences.map((exp, i) =>
                                                    i === index ? { ...exp, companyName: e.target.value } : exp
                                                );
                                                setForm({ ...form, experiences: updatedExperiences });
                                            }}
                                        />

                                        <input
                                            className="border border-gray-400 rounded w-40"
                                            placeholder="Job Title"
                                            type="text"
                                            value={ele?.position || ""}
                                            onChange={(e) => {
                                                const updatedExperiences = form.experiences.map((exp, i) =>
                                                    i === index ? { ...exp, position: e.target.value } : exp
                                                );
                                                setForm({ ...form, experiences: updatedExperiences });
                                            }}
                                        />

                                        <button
                                            className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-700"
                                            onClick={() => {
                                                handleRemove(ele._id)
                                                const updatedExperiences = form.experiences.filter((_, i) => i !== index);
                                                setForm({ ...form, experiences: updatedExperiences })

                                            }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}

                                <button
                                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-700 transition"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        const newExperience = { startingDate: "", endingDate: "", companyName: "", position: "" };
                                        setForm({ ...form, experiences: [...(form.experiences || []), newExperience] });
                                    }}
                                >
                                    Add Experience
                                </button>
                            </div>


                            {/* pricing form  */}
                            <div>
                                <p className="text-center text-lg font-semibold ">Pricing</p>

                                <p>Basic</p>
                                <div className="flex space-x-5">

                                    <input className="border border-gray-400 rounded w-30" placeholder="Amount" value={form?.pricing?.basic?.amount}
                                        onChange={(e) => {
                                            setForm({
                                                ...form,
                                                pricing: {
                                                    ...form.pricing,
                                                    basic: {
                                                        ...(form.pricing?.basic || {}),
                                                        amount: e.target.value,
                                                    },
                                                },
                                            });
                                        }}
                                    />
                                    <input className="border border-gray-400 rounded w-30" placeholder="Session Duration" value={form?.pricing?.basic?.sessionDuration} onChange={(e) => {
                                        setForm({
                                            ...form,
                                            pricing: {
                                                ...form.pricing,
                                                basic: {
                                                    ...(form.pricing.basic || {}),
                                                    sessionDuration: e.target.value,
                                                },
                                            },
                                        });
                                    }} />
                                    <input className="border border-gray-400 rounded w-30" placeholder="Call" value={form?.pricing?.basic?.call} onChange={(e) => {
                                        setForm({
                                            ...form,
                                            pricing: {
                                                ...form.pricing,
                                                basic: {
                                                    ...(form.pricing.basic || {}),
                                                    call: e.target.value,
                                                },
                                            },
                                        });
                                    }} />
                                    <input className="border border-gray-400 rounded w-30" placeholder="Video Call" value={form?.pricing?.basic?.videoCall} onChange={(e) => {
                                        setForm({
                                            ...form,
                                            pricing: {
                                                ...form.pricing,
                                                basic: {
                                                    ...(form.pricing.basic || {}),
                                                    videoCall: e.target.value,
                                                },
                                            },
                                        });
                                    }} />
                                    <input className="border border-gray-400 rounded w-30" placeholder="Features" value={form?.pricing?.basic?.features} onChange={(e) => {
                                        setForm({
                                            ...form,
                                            pricing: {
                                                ...form.pricing,
                                                basic: {
                                                    ...(form.pricing.basic || {}),
                                                    features: e.target.value,
                                                },
                                            },
                                        });
                                    }} />
                                </div>

                                <p>pro</p>
                                <div className="flex space-x-5">

                                    <input className="border border-gray-400 rounded w-30" placeholder="Amount" value={form?.pricing?.pro?.amount} onChange={(e) => {
                                        setForm({
                                            ...form,
                                            pricing: {
                                                ...form.pricing,
                                                pro: {
                                                    ...(form.pricing.pro || {}),
                                                    amount: e.target.value,
                                                },
                                            },
                                        });
                                    }} />
                                    <input className="border border-gray-400 rounded w-30" placeholder="Session Duration" value={form?.pricing?.pro?.sessionDuration} onChange={(e) => {
                                        setForm({
                                            ...form,
                                            pricing: {
                                                ...form.pricing,
                                                pro: {
                                                    ...(form.pricing.pro || {}),
                                                    sessionDuration: e.target.value,
                                                },
                                            },
                                        });
                                    }} />
                                    <input className="border border-gray-400 rounded w-30" placeholder="call" value={form?.pricing?.pro?.call} onChange={(e) => {
                                        setForm({
                                            ...form,
                                            pricing: {
                                                ...form.pricing,
                                                pro: {
                                                    ...(form.pricing.pro || {}),
                                                    call: e.target.value,
                                                },
                                            },
                                        });
                                    }} />
                                    <input className="border border-gray-400 rounded w-30" placeholder="Video Call" value={form?.pricing?.pro?.videoCall} onChange={(e) => {
                                        setForm({
                                            ...form,
                                            pricing: {
                                                ...form.pricing,
                                                pro: {
                                                    ...(form.pricing.pro || {}),
                                                    videoCall: e.target.value,
                                                },
                                            },
                                        });
                                    }} />
                                    <input className="border border-gray-400 rounded w-30" placeholder="Features" value={form?.pricing?.pro?.features} onChange={(e) => {
                                        setForm({
                                            ...form,
                                            pricing: {
                                                ...form.pricing,
                                                pro: {
                                                    ...(form.pricing.pro || {}),
                                                    features: e.target.value,
                                                },
                                            },
                                        });
                                    }} />
                                </div>
                                {clientErrors && <p className="text-sm text-red-500 mt-1">{clientErrors.pricing}</p>}

                            </div>

                            <input
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2 rounded-lg shadow hover:bg-blue-700"
                                value="Save"
                            />
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}