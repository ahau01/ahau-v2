use profiles_integrity::{PersonalInformation, Profile};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct MyProfileHistory {
    pub profiles: Vec<Profile>,
    pub personal_information: Vec<PersonalInformation>,
}
