'use client'
import { React, useState, useRef } from 'react'
import '@/app/styles/statistic.css'

const Statistic = () => {
    const leftArrow = useRef(undefined)
    const rightArrow = useRef(undefined)
    const [leftArrowStatus, setLeftArrowStatus] = useState(false)
    const [rightArrowStatus, setRightArrowStatus] = useState(true)

    const handleLeftArrowClick = () => {
        if (leftArrowStatus) {
            setLeftArrowStatus(false)
            setRightArrowStatus(true)
        }
    }

    const handleRightArrowClick = () => {
        if (rightArrowStatus) {
            setLeftArrowStatus(true)
            setRightArrowStatus(false)
        }
    }

    return (
        <div className='statistic-container'>
            <div className="statistic-title-container">
                <div className="statistic-title">Your Statistic</div>
                <div className="statistic-title-content">
                    <div className="statistic-bloodPressure">
                        <div className="statistic-title-icon">
                            <svg fill="#0f0f0f" viewBox="0 0 256 256" id="Flat" xmlns="http://www.w3.org/2000/svg" stroke="#0f0f0f"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M174.03662,47.75049a254.574,254.574,0,0,0-41.44873-38.3042,7.99885,7.99885,0,0,0-9.17578,0,254.574,254.574,0,0,0-41.44873,38.3042C54.51074,79.3208,40,112.60352,40,144a88,88,0,0,0,176,0C216,112.60352,201.48926,79.3208,174.03662,47.75049Zm9.17578,105.646a55.85216,55.85216,0,0,1-45.76562,45.7085,8,8,0,1,1-2.6543-15.77832,39.8386,39.8386,0,0,0,32.64453-32.604,8.00019,8.00019,0,0,1,15.77539,2.67382Z"></path> </g></svg>
                        </div>
                        <div className="statistic-title-content-text">
                            <div className="statistic-title-content-heading">120/80</div>
                            <div className="statistic-title-content-subHeading">BP (mmHg)</div>
                        </div>
                    </div>
                    <div className="statistic-heartRate">
                        <div className="statistic-title-icon">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M3.48877 6.00387C2.76311 7.24787 2.52428 8.97403 2.97014 10.7575C3.13059 11.3992 3.59703 12.2243 4.33627 13.174C5.06116 14.1052 5.9864 15.0787 6.96636 16.0127C8.90945 17.8648 11.0006 19.4985 12 20.254C12.5679 19.8247 13.4884 19.1118 14.5338 18.2364C14.7154 18.0844 14.9444 18 15.1812 18H15.2755C16.1864 18 16.6096 19.1044 15.9123 19.6905C14.7762 20.6456 13.7775 21.418 13.181 21.8683C12.4803 22.3974 11.5197 22.3974 10.819 21.8683C9.80433 21.1022 7.62583 19.4042 5.58648 17.4605C4.56733 16.4891 3.56585 15.4402 2.75806 14.4025C1.96461 13.3832 1.2924 12.2927 1.02986 11.2425C0.475714 9.02597 0.736884 6.75213 1.76121 4.99613C2.80291 3.21035 4.62017 2 6.99998 2C9.59038 2 11.0969 3.95772 11.8944 5.55278C11.9307 5.62535 11.9659 5.69784 12 5.77011C12.0341 5.69784 12.0693 5.62535 12.1056 5.55279C12.9031 3.95772 14.4096 2 17 2C19.3798 2 21.1971 3.21035 22.2388 4.99613C23.1118 6.49271 23.4305 8.36544 23.1625 10.2583C23.1008 10.6946 22.7141 11 22.2735 11C21.6284 11 21.169 10.3586 21.2387 9.71731C21.3774 8.44008 21.1371 7.07683 20.5112 6.00387C19.8029 4.78965 18.6202 4 17 4C15.5904 4 14.5969 5.04228 13.8944 6.44721C13.5569 7.12228 13.3275 7.80745 13.1823 8.33015C13.1102 8.58959 13.0602 8.80435 13.0286 8.95172C12.9167 9.47392 12.3143 9.5 12 9.5C11.6857 9.5 11.0823 9.46905 10.9714 8.95172C10.9398 8.80436 10.8898 8.58959 10.8177 8.33015C10.6725 7.80745 10.4431 7.12229 10.1056 6.44722C9.40308 5.04228 8.40956 4 6.99998 4C5.37979 4 4.19706 4.78965 3.48877 6.00387Z" fill="#0F0F0F"></path> <path d="M15.9191 9.60608C15.7658 9.24819 15.4186 9.01187 15.0294 9.00043C14.6402 8.98899 14.2797 9.20452 14.1056 9.55279L12.382 13H9C8.44771 13 8 13.4477 8 14C8 14.5523 8.44771 15 9 15H13C13.3788 15 13.725 14.786 13.8944 14.4472L14.9302 12.3757L17.0808 17.3939C17.2215 17.7221 17.5265 17.9504 17.881 17.9929C18.2355 18.0354 18.5858 17.8856 18.8 17.6L21.5 14H23C23.5523 14 24 13.5523 24 13C24 12.4477 23.5523 12 23 12H21C20.6852 12 20.3888 12.1482 20.2 12.4L18.2378 15.0163L15.9191 9.60608Z" fill="#0F0F0F"></path> </g></svg>
                        </div>
                        <div className="statistic-title-content-text">
                            <div className="statistic-title-content-heading">70.12</div>
                            <div className="statistic-title-content-subHeading">Heart Rate (Bpm)</div>
                        </div>
                    </div>
                    <div className="statistic-Sugar">
                        <div className="statistic-title-icon">
                            <svg viewBox="0 -0.5 49 49" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fillRule="evenodd" clipRule="evenodd" d="M13.9502 4.09145C12.2933 4.0928 10.9513 5.43705 10.9526 7.0939L10.9731 32.0939C10.9745 33.7507 12.3187 35.0928 13.9756 35.0914L18.7256 35.0875C19.4159 35.087 19.9751 34.5269 19.9745 33.8365C19.974 33.1462 20.5332 32.5861 21.2235 32.5855L28.7235 32.5794C29.4139 32.5788 29.974 33.138 29.9745 33.8283C29.9751 34.5187 30.5352 35.0779 31.2256 35.0773L35.9756 35.0734C37.6324 35.0721 38.9745 33.7278 38.9731 32.071L38.9526 7.07097C38.9513 5.41412 37.607 4.07207 35.9502 4.07343L13.9502 4.09145ZM33.9534 8.07504L15.9534 8.08978L15.9682 26.0898L33.9682 26.075L33.9534 8.07504ZM16.9712 29.589C16.9707 29.0367 17.4181 28.5886 17.9704 28.5881L21.9702 28.5849C22.5225 28.5844 22.9706 29.0318 22.971 29.584C22.9715 30.1363 22.5242 30.5844 21.9719 30.5849L17.972 30.5881C17.4197 30.5886 16.9716 30.1412 16.9712 29.589ZM27.9704 28.5799C27.4181 28.5804 26.9707 29.0285 26.9712 29.5808C26.9716 30.133 27.4197 30.5804 27.972 30.5799L31.9719 30.5767C32.5242 30.5762 32.9715 30.1281 32.971 29.5758C32.9706 29.0236 32.5225 28.5762 31.9702 28.5767L27.9704 28.5799Z" fill="#0f0f0f"></path> <path d="M28.9619 18.3342C28.9637 20.4676 27.205 22.1452 24.965 22.147C22.725 22.1489 20.9637 20.4741 20.9619 18.3408C20.9602 16.2075 24.9563 11.4804 24.9563 11.4804C24.9563 11.4804 28.9603 16.3533 28.9619 18.3342Z" fill="#0f0f0f"></path> <path fillRule="evenodd" clipRule="evenodd" d="M28.974 33.0792L20.974 33.0857L20.9814 42.0857L28.9814 42.0791L28.974 33.0792ZM18.9724 31.0873L18.9831 44.0873L30.9831 44.0775L30.9724 31.0775L18.9724 31.0873Z" fill="#0f0f0f"></path> <path d="M26.9782 38.0808C26.9791 39.1854 26.0844 40.0815 24.9798 40.0824C23.8753 40.0833 22.9791 39.1886 22.9782 38.0841C22.9773 36.9795 23.872 36.0833 24.9766 36.0824C26.0811 36.0815 26.9773 36.9762 26.9782 38.0808Z" fill="#0f0f0f"></path> </g></svg>
                        </div>
                        <div className="statistic-title-content-text">
                            <div className="statistic-title-content-heading">120/80</div>
                            <div className="statistic-title-content-subHeading">Sugar (mg/dL)</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="statistic-content">
                <div className="statistic-personalInfo">
                    <div className="statistic-personalInfo-header">
                        <div className="statistic-personalInfo-title">Personal Information</div>
                        <div className="statistic-personalInfo-header-content">
                            <div className="statistic-personalInfo-image"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path opacity="0.4" d="M12 22.01C17.5228 22.01 22 17.5329 22 12.01C22 6.48716 17.5228 2.01001 12 2.01001C6.47715 2.01001 2 6.48716 2 12.01C2 17.5329 6.47715 22.01 12 22.01Z" fill="#292D32"></path> <path d="M12 6.93994C9.93 6.93994 8.25 8.61994 8.25 10.6899C8.25 12.7199 9.84 14.3699 11.95 14.4299C11.98 14.4299 12.02 14.4299 12.04 14.4299C12.06 14.4299 12.09 14.4299 12.11 14.4299C12.12 14.4299 12.13 14.4299 12.13 14.4299C14.15 14.3599 15.74 12.7199 15.75 10.6899C15.75 8.61994 14.07 6.93994 12 6.93994Z" fill="#292D32"></path> <path d="M18.7807 19.36C17.0007 21 14.6207 22.01 12.0007 22.01C9.3807 22.01 7.0007 21 5.2207 19.36C5.4607 18.45 6.1107 17.62 7.0607 16.98C9.7907 15.16 14.2307 15.16 16.9407 16.98C17.9007 17.62 18.5407 18.45 18.7807 19.36Z" fill="#292D32"></path> </g></svg></div>
                            <div className="statistic-personalInfo-text">
                                <div className="statistic-personalInfo-name">Biromon Junior</div>
                                <div className="statistic-personalInfo-status">Patient</div>
                            </div>
                        </div>
                    </div>

                    <div className="statistic-personalInfo-slider">
                        <div className="statistic-personalInfo-slider-text">Detail Information</div>
                        <div className="statistic-arrow-container">
                            <div 
                                className={`statistic-arrow ${leftArrowStatus ? 'active-arrow cursor-pointer' : 'cursor-disabled'}`} 
                                ref={leftArrow} 
                                onClick={handleLeftArrowClick}
                            >
                                <svg className='left' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fillRule="evenodd" clipRule="evenodd" d="M11.7071 4.29289C12.0976 4.68342 12.0976 5.31658 11.7071 5.70711L6.41421 11H20C20.5523 11 21 11.4477 21 12C21 12.5523 20.5523 13 20 13H6.41421L11.7071 18.2929C12.0976 18.6834 12.0976 19.3166 11.7071 19.7071C11.3166 20.0976 10.6834 20.0976 10.2929 19.7071L3.29289 12.7071C3.10536 12.5196 3 12.2652 3 12C3 11.7348 3.10536 11.4804 3.29289 11.2929L10.2929 4.29289C10.6834 3.90237 11.3166 3.90237 11.7071 4.29289Z" fill="#0f0f0f"></path> </g></svg>
                                <svg className='active-left' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fillRule="evenodd" clipRule="evenodd" d="M11.7071 4.29289C12.0976 4.68342 12.0976 5.31658 11.7071 5.70711L6.41421 11H20C20.5523 11 21 11.4477 21 12C21 12.5523 20.5523 13 20 13H6.41421L11.7071 18.2929C12.0976 18.6834 12.0976 19.3166 11.7071 19.7071C11.3166 20.0976 10.6834 20.0976 10.2929 19.7071L3.29289 12.7071C3.10536 12.5196 3 12.2652 3 12C3 11.7348 3.10536 11.4804 3.29289 11.2929L10.2929 4.29289C10.6834 3.90237 11.3166 3.90237 11.7071 4.29289Z" fill="#e5e5e5"></path> </g></svg>
                            </div>
                            <div 
                                className={`statistic-arrow ${rightArrowStatus ? 'active-arrow cursor-pointer' : 'cursor-disabled'}`} 
                                ref={rightArrow} 
                                onClick={handleRightArrowClick}
                            >
                                <svg className='right' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fillRule="evenodd" clipRule="evenodd" d="M12.2929 4.29289C12.6834 3.90237 13.3166 3.90237 13.7071 4.29289L20.7071 11.2929C21.0976 11.6834 21.0976 12.3166 20.7071 12.7071L13.7071 19.7071C13.3166 20.0976 12.6834 20.0976 12.2929 19.7071C11.9024 19.3166 11.9024 18.6834 12.2929 18.2929L17.5858 13H4C3.44772 13 3 12.5523 3 12C3 11.4477 3.44772 11 4 11H17.5858L12.2929 5.70711C11.9024 5.31658 11.9024 4.68342 12.2929 4.29289Z" fill="#0f0f0f"></path> </g></svg>
                                <svg className='active-right' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fillRule="evenodd" clipRule="evenodd" d="M12.2929 4.29289C12.6834 3.90237 13.3166 3.90237 13.7071 4.29289L20.7071 11.2929C21.0976 11.6834 21.0976 12.3166 20.7071 12.7071L13.7071 19.7071C13.3166 20.0976 12.6834 20.0976 12.2929 19.7071C11.9024 19.3166 11.9024 18.6834 12.2929 18.2929L17.5858 13H4C3.44772 13 3 12.5523 3 12C3 11.4477 3.44772 11 4 11H17.5858L12.2929 5.70711C11.9024 5.31658 11.9024 4.68342 12.2929 4.29289Z" fill="#e5e5e5"></path> </g></svg>
                            </div>
                        </div>
                    </div>

                    <div 
                        className="statistic-personalInfo-content-left"
                        style={{ display: rightArrowStatus ? 'block' : 'none' }}
                    >
                        <div className="statistic-personalInfo-contents">
                            <div className="statistic-personalInfo-titles">
                                <div className="statistic-personalInfo-title-icon">
                                    <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="#6b6b6b" stroke="#6b6b6b"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill="#6b6b6b" d="M512 512a192 192 0 1 0 0-384 192 192 0 0 0 0 384zm0 64a256 256 0 1 1 0-512 256 256 0 0 1 0 512z"></path><path fill="#6b6b6b" d="M512 512a32 32 0 0 1 32 32v256a32 32 0 1 1-64 0V544a32 32 0 0 1 32-32z"></path><path fill="#6b6b6b" d="M384 649.088v64.96C269.76 732.352 192 771.904 192 800c0 37.696 139.904 96 320 96s320-58.304 320-96c0-28.16-77.76-67.648-192-85.952v-64.96C789.12 671.04 896 730.368 896 800c0 88.32-171.904 160-384 160s-384-71.68-384-160c0-69.696 106.88-128.96 256-150.912z"></path></g></svg>
                                </div>
                                Place
                            </div>
                            <div className="statistic-personalInfo-content">Ghaziabad</div>
                        </div>
                        <div className="statistic-personalInfo-contents">
                            <div className="statistic-personalInfo-titles">
                                <div className="statistic-personalInfo-title-icon">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M7 10H17M7 14H12M7 3V5M17 3V5M6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4802 21 18.9201 21 17.8V8.2C21 7.07989 21 6.51984 20.782 6.09202C20.5903 5.71569 20.2843 5.40973 19.908 5.21799C19.4802 5 18.9201 5 17.8 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21Z" stroke="#6b6b6b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
                                </div>
                                Age
                            </div>
                            <div className="statistic-personalInfo-content">45</div>
                        </div>
                        <div className="statistic-personalInfo-contents">
                            <div className="statistic-personalInfo-titles">
                                <div className="statistic-personalInfo-title-icon">
                                    <svg fill="#6b6b6b" viewBox="0 0 256 256" id="Flat" xmlns="http://www.w3.org/2000/svg" stroke="#6b6b6b"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M219.9978,23.95557q-.00219-.56984-.05749-1.13819c-.018-.18408-.05237-.36279-.07849-.54443-.02979-.20557-.05371-.41211-.09424-.61621-.04029-.20362-.09607-.40088-.14649-.60059-.04541-.18017-.08484-.36084-.13867-.53906-.05884-.19434-.13159-.38135-.19971-.57129-.06445-.17969-.12353-.36084-.19677-.5376-.07349-.17724-.15967-.34668-.24109-.51953-.08582-.18213-.16687-.36621-.26257-.54492-.088-.16455-.18824-.32031-.2837-.48047-.10534-.17627-.2052-.355-.32031-.52685-.11572-.17334-.24475-.33545-.369-.502-.11-.14746-.21252-.29834-.3302-.4414-.23462-.28614-.4834-.55957-.74316-.82227-.01782-.01807-.03247-.03809-.05054-.05615-.01831-.01856-.03857-.0332-.05688-.05127q-.39441-.38966-.82227-.74317c-.13965-.11474-.28686-.21435-.43042-.32177-.16992-.127-.33606-.25879-.51269-.377-.16883-.11328-.34424-.21093-.51734-.31445-.16333-.09765-.32324-.20019-.49145-.29-.1731-.09277-.3512-.1709-.52759-.25439-.17871-.08448-.35462-.17383-.538-.24951-.16932-.07032-.34229-.12647-.514-.18848-.19751-.07129-.39307-.14649-.59534-.208-.16882-.05078-.34045-.08789-.51086-.13135-.20874-.05322-.41529-.11132-.62818-.15332-.19055-.03759-.383-.05957-.57507-.08789-.19544-.02881-.38831-.06494-.58679-.08447-.33252-.03271-.666-.04541-.99988-.05078C208.11853,12.0083,208.0603,12,208,12H172a12,12,0,0,0,0,24h7.0293l-15.051,15.05127A71.97526,71.97526,0,1,0,108,178.981V192H88a12,12,0,0,0,0,24h20v16a12,12,0,0,0,24,0V216h20a12,12,0,0,0,0-24H132V178.981A71.928,71.928,0,0,0,180.27783,68.69287L196,52.9707V60a12,12,0,0,0,24,0V24C220,23.98486,219.9978,23.97021,219.9978,23.95557ZM120,156a48,48,0,1,1,48-48A48.05468,48.05468,0,0,1,120,156Z"></path> </g></svg>
                                </div>
                                Gender
                            </div>
                            <div className="statistic-personalInfo-content">Male</div>
                        </div>
                        <div className="statistic-personalInfo-contents">
                            <div className="statistic-personalInfo-titles">
                                <div className="statistic-personalInfo-title-icon">
                                    <svg fill="#6b6b6b" viewBox="-8 0 512 512" xmlns="http://www.w3.org/2000/svg" stroke="#6b6b6b"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M127.79 314.01c4.31,-0.07 8.47,1.63 11.53,4.68l48.68 48.68 48.69 -48.68c6.24,-6.25 16.38,-6.25 22.62,0l48.69 48.68 48.68 -48.68c6.25,-6.25 16.38,-6.25 22.63,0l40 40c3,3 4.69,7.06 4.69,11.31 0,4.25 -1.69,8.31 -4.69,11.31 -3,3 -7.06,4.69 -11.31,4.69 -4.24,0 -8.31,-1.69 -11.32,-4.69l-28.68 -28.68 -48.69 48.68c-6.25,6.25 -16.38,6.25 -22.62,0l-48.69 -48.68 -48.69 48.68c-6.24,6.25 -16.37,6.25 -22.62,0l-48.69 -48.68 -28.68 28.68c-3.01,3 -7.07,4.69 -11.32,4.69 -4.25,0 -8.31,-1.69 -11.31,-4.69 -3,-3 -4.69,-7.06 -4.69,-11.31 0,-4.25 1.69,-8.31 4.69,-11.31l40 -40c2.95,-2.95 6.93,-4.63 11.1,-4.68zm24.21 -99.41l-28.7 28.7c-14.8,14.8 -37.8,-7.5 -22.6,-22.6l28.7 -28.7 -28.7 -28.7c-15,-15 7.7,-37.6 22.6,-22.6l28.7 28.7 28.7 -28.7c15,-15 37.6,7.7 22.6,22.6l-28.7 28.7 28.7 28.7c15.2,15.2 -7.9,37.4 -22.6,22.6l-28.7 -28.7zm243.3 6.1c15.2,15.2 -7.9,37.4 -22.6,22.6l-28.7 -28.7 -28.7 28.7c-14.8,14.8 -37.8,-7.5 -22.6,-22.6l28.7 -28.7 -28.7 -28.7c-15,-15 7.7,-37.6 22.6,-22.6l28.7 28.7 28.7 -28.7c15,-15 37.6,7.7 22.6,22.6l-28.7 28.7 28.7 28.7zm-147.3 -212.7c-137,0 -248,111 -248,248 0,137 111,248 248,248 137,0 248,-111 248,-248 0,-137 -111,-248 -248,-248z"></path></g></svg>
                                </div>
                                Weight
                            </div>
                            <div className="statistic-personalInfo-content">70 kg</div>
                        </div>
                        <div className="statistic-personalInfo-contents">
                            <div className="statistic-personalInfo-titles">
                                <div className="statistic-personalInfo-title-icon">
                                    <svg fill="#6b6b6b" viewBox="-8 0 512 512" xmlns="http://www.w3.org/2000/svg" stroke="#6b6b6b"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M127.79 314.01c4.31,-0.07 8.47,1.63 11.53,4.68l48.68 48.68 48.69 -48.68c6.24,-6.25 16.38,-6.25 22.62,0l48.69 48.68 48.68 -48.68c6.25,-6.25 16.38,-6.25 22.63,0l40 40c3,3 4.69,7.06 4.69,11.31 0,4.25 -1.69,8.31 -4.69,11.31 -3,3 -7.06,4.69 -11.31,4.69 -4.24,0 -8.31,-1.69 -11.32,-4.69l-28.68 -28.68 -48.69 48.68c-6.25,6.25 -16.38,6.25 -22.62,0l-48.69 -48.68 -48.69 48.68c-6.24,6.25 -16.37,6.25 -22.62,0l-48.69 -48.68 -28.68 28.68c-3.01,3 -7.07,4.69 -11.32,4.69 -4.25,0 -8.31,-1.69 -11.31,-4.69 -3,-3 -4.69,-7.06 -4.69,-11.31 0,-4.25 1.69,-8.31 4.69,-11.31l40 -40c2.95,-2.95 6.93,-4.63 11.1,-4.68zm24.21 -99.41l-28.7 28.7c-14.8,14.8 -37.8,-7.5 -22.6,-22.6l28.7 -28.7 -28.7 -28.7c-15,-15 7.7,-37.6 22.6,-22.6l28.7 28.7 28.7 -28.7c15,-15 37.6,7.7 22.6,22.6l-28.7 28.7 28.7 28.7c15.2,15.2 -7.9,37.4 -22.6,22.6l-28.7 -28.7zm243.3 6.1c15.2,15.2 -7.9,37.4 -22.6,22.6l-28.7 -28.7 -28.7 28.7c-14.8,14.8 -37.8,-7.5 -22.6,-22.6l28.7 -28.7 -28.7 -28.7c-15,-15 7.7,-37.6 22.6,-22.6l28.7 28.7 28.7 -28.7c15,-15 37.6,7.7 22.6,22.6l-28.7 28.7 28.7 28.7zm-147.3 -212.7c-137,0 -248,111 -248,248 0,137 111,248 248,248 137,0 248,-111 248,-248 0,-137 -111,-248 -248,-248z"></path></g></svg>
                                </div>
                                Height
                            </div>
                            <div className="statistic-personalInfo-content">170 cm</div>
                        </div>
                        <div className="statistic-personalInfo-contents">
                            <div className="statistic-personalInfo-titles">
                                <div className="statistic-personalInfo-title-icon">
                                    <svg fill="#6b6b6b" viewBox="-8 0 512 512" xmlns="http://www.w3.org/2000/svg" stroke="#6b6b6b"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M127.79 314.01c4.31,-0.07 8.47,1.63 11.53,4.68l48.68 48.68 48.69 -48.68c6.24,-6.25 16.38,-6.25 22.62,0l48.69 48.68 48.68 -48.68c6.25,-6.25 16.38,-6.25 22.63,0l40 40c3,3 4.69,7.06 4.69,11.31 0,4.25 -1.69,8.31 -4.69,11.31 -3,3 -7.06,4.69 -11.31,4.69 -4.24,0 -8.31,-1.69 -11.32,-4.69l-28.68 -28.68 -48.69 48.68c-6.25,6.25 -16.38,6.25 -22.62,0l-48.69 -48.68 -48.69 48.68c-6.24,6.25 -16.37,6.25 -22.62,0l-48.69 -48.68 -28.68 28.68c-3.01,3 -7.07,4.69 -11.32,4.69 -4.25,0 -8.31,-1.69 -11.31,-4.69 -3,-3 -4.69,-7.06 -4.69,-11.31 0,-4.25 1.69,-8.31 4.69,-11.31l40 -40c2.95,-2.95 6.93,-4.63 11.1,-4.68zm24.21 -99.41l-28.7 28.7c-14.8,14.8 -37.8,-7.5 -22.6,-22.6l28.7 -28.7 -28.7 -28.7c-15,-15 7.7,-37.6 22.6,-22.6l28.7 28.7 28.7 -28.7c15,-15 37.6,7.7 22.6,22.6l-28.7 28.7 28.7 28.7c15.2,15.2 -7.9,37.4 -22.6,22.6l-28.7 -28.7zm243.3 6.1c15.2,15.2 -7.9,37.4 -22.6,22.6l-28.7 -28.7 -28.7 28.7c-14.8,14.8 -37.8,-7.5 -22.6,-22.6l28.7 -28.7 -28.7 -28.7c-15,-15 7.7,-37.6 22.6,-22.6l28.7 28.7 28.7 -28.7c15,-15 37.6,7.7 22.6,22.6l-28.7 28.7 28.7 28.7zm-147.3 -212.7c-137,0 -248,111 -248,248 0,137 111,248 248,248 137,0 248,-111 248,-248 0,-137 -111,-248 -248,-248z"></path></g></svg>
                                </div>
                                Allergies
                            </div>
                            <div className="statistic-personalInfo-content">Dust, Pollution</div>
                        </div>
                        <div className="statistic-personalInfo-contents">
                            <div className="statistic-personalInfo-titles">
                                <div className="statistic-personalInfo-title-icon">

                                </div>
                                Desease
                            </div>
                            <div className="statistic-personalInfo-content">Fever, Cold</div>
                        </div>
                    </div>

                    <div 
                        className="statistic-personalInfo-content-right"
                        style={{ display: leftArrowStatus ? 'block' : 'none' }}
                    >
                        <div className="statistic-personalInfo-contents">
                            <div className="statistic-personalInfo-titles">
                                <div className="statistic-personalInfo-title-icon">

                                </div>
                                Medication
                            </div>
                            <div className="statistic-personalInfo-content">Paracetamol, Crocin</div>
                        </div>
                        <div className="statistic-personalInfo-contents">
                            <div className="statistic-personalInfo-titles">
                                <div className="statistic-personalInfo-title-icon">

                                </div>
                                Smoke
                            </div>
                            <div className="statistic-personalInfo-content">Yes</div>
                        </div>
                        <div className="statistic-personalInfo-contents">
                            <div className="statistic-personalInfo-titles">
                                <div className="statistic-personalInfo-title-icon">

                                </div>
                                Alcohol
                            </div>
                            <div className="statistic-personalInfo-content">Yes</div>
                        </div>
                        <div className="statistic-personalInfo-contents">
                            <div className="statistic-personalInfo-titles">
                                <div className="statistic-personalInfo-title-icon">

                                </div>
                                Physical Acitivity
                            </div>
                            <div className="statistic-personalInfo-content">2 Times</div>
                        </div>
                        <div className="statistic-personalInfo-contents">
                            <div className="statistic-personalInfo-titles">
                                <div className="statistic-personalInfo-title-icon">

                                </div>
                                Diet
                            </div>
                            <div className="statistic-personalInfo-content">Vegiterian</div>
                        </div>
                        <div className="statistic-personalInfo-contents">
                            <div className="statistic-personalInfo-titles">
                                <div className="statistic-personalInfo-title-icon">

                                </div>
                                Sleep
                            </div>
                            <div className="statistic-personalInfo-content">8 Hrs</div>
                        </div>
                        <div className="statistic-personalInfo-contents">
                            <div className="statistic-personalInfo-titles">
                                <div className="statistic-personalInfo-title-icon">

                                </div>
                                Medication
                            </div>
                            <div className="statistic-personalInfo-content">Paracetamol, Crocin</div>
                        </div>
                    </div>
                </div>
                <div className="statistic-performance">d</div>
                <div className="statistic-analytics">d</div>
            </div>
            <div className="statistic-cont"></div>
        </div>
    )
}

export default Statistic
