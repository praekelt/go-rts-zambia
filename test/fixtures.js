module.exports = function() {
    return [


    // cms_district_load
    // -----------------

    {
        "request": {
            "url": "http://qa/api/v1/district/",
            "method": "GET",
        },
        "response": {
            "code": 200,
            "data": {
                "meta": {
                        "limit": 1000,
                        "next": null,
                        "offset": 0,
                        "previous": null,
                        "total_count": 18
                    },
                "objects": [
                    {
                        "id": 1,
                        "name": "Mporokoso",
                        "province": {
                            "id": 1,
                            "name": "Northern Province",
                            "resource_uri": "/api/v1/province/1/"
                        },
                        "resource_uri": "/api/v1/district/1/"
                    },
                    {
                        "id": 2,
                        "name": "Mungwi",
                        "province": {
                            "id": 1,
                            "name": "Northern Province",
                            "resource_uri": "/api/v1/province/1/"
                        },
                        "resource_uri": "/api/v1/district/2/"
                    },
                    {
                        "id": 3,
                        "name": "Mansa",
                        "province": {
                            "id": 2,
                            "name": "Luapula Province",
                            "resource_uri": "/api/v1/province/2/"
                        },
                        "resource_uri": "/api/v1/district/3/"
                    },
                    {
                        "id": 4,
                        "name": "Mwense",
                        "province": {
                            "id": 2,
                            "name": "Luapula Province",
                            "resource_uri": "/api/v1/province/2/"
                        },
                        "resource_uri": "/api/v1/district/4/"
                    },
                    {
                        "id": 10,
                        "name": "Mongu",
                        "province": {
                            "id": 5,
                            "name": "Western Province",
                            "resource_uri": "/api/v1/province/5/"
                        },
                        "resource_uri": "/api/v1/district/10/"
                    },
                    {
                        "id": 11,
                        "name": "Sesheke",
                        "province": {
                            "id": 5,
                            "name": "Western Province",
                            "resource_uri": "/api/v1/province/5/"
                        },
                        "resource_uri": "/api/v1/district/11/"
                    },
                    {
                        "id": 12,
                        "name": "Mufumbwe",
                        "province": {
                            "id": 6,
                            "name": "North Western Province",
                            "resource_uri": "/api/v1/province/6/"
                        },
                        "resource_uri": "/api/v1/district/12/"
                    },
                    {
                        "id": 13,
                        "name": "Solwezi",
                        "province": {
                            "id": 6,
                            "name": "North Western Province",
                            "resource_uri": "/api/v1/province/6/"
                        },
                        "resource_uri": "/api/v1/district/13/"
                    },
                    {
                        "id": 14,
                        "name": "Chembe",
                        "province": {
                            "id": 2,
                            "name": "Luapula Province",
                            "resource_uri": "/api/v1/province/2/"
                        },
                        "resource_uri": "/api/v1/district/14/"
                    },
                    {
                        "id": 15,
                        "name": "Chipili",
                        "province": {
                            "id": 2,
                            "name": "Luapula Province",
                            "resource_uri": "/api/v1/province/2/"
                        },
                        "resource_uri": "/api/v1/district/15/"
                    },
                    {
                        "id": 16,
                        "name": "Limulunga",
                        "province": {
                            "id": 5,
                            "name": "Western Province",
                            "resource_uri": "/api/v1/province/5/"
                        },
                        "resource_uri": "/api/v1/district/16/"
                    },
                    {
                        "id": 17,
                        "name": "Mulobezi",
                        "province": {
                            "id": 5,
                            "name": "Western Province",
                            "resource_uri": "/api/v1/province/5/"
                        },
                        "resource_uri": "/api/v1/district/17/"
                    },
                    {
                        "id": 18,
                        "name": "Mwandi",
                        "province": {
                            "id": 5,
                            "name": "Western Province",
                            "resource_uri": "/api/v1/province/5/"
                        },
                        "resource_uri": "/api/v1/district/18/"
                    },
                    {
                        "id": 9,
                        "name": "Lundazi",
                        "province": {
                            "id": 4,
                            "name": "Eastern Province",
                            "resource_uri": "/api/v1/province/4/"
                        },
                        "resource_uri": "/api/v1/district/9/"
                    },
                    {
                        "id": 8,
                        "name": "Chipata",
                        "province": {
                            "id": 4,
                            "name": "Eastern Province",
                            "resource_uri": "/api/v1/province/4/"
                        },
                        "resource_uri": "/api/v1/district/8/"
                    },
                    {
                        "id": 6,
                        "name": "Isoka",
                        "province": {
                            "id": 3,
                            "name": "Muchinga Province",
                            "resource_uri": "/api/v1/province/3/"
                        },
                        "resource_uri": "/api/v1/district/6/"
                    },
                    {
                        "id": 5,
                        "name": "Chinsali",
                        "province": {
                            "id": 3,
                            "name": "Muchinga Province",
                            "resource_uri": "/api/v1/province/3/"
                        },
                        "resource_uri": "/api/v1/district/5/"
                    },
                    {
                        "id": 7,
                        "name": "Shiwang'andu",
                        "province": {
                            "id": 3,
                            "name": "Muchinga Province",
                            "resource_uri": "/api/v1/province/3/"
                        },
                        "resource_uri": "/api/v1/district/7/"
                    }
                ]
            }
        },
    },


    // cms_emis_load
    // -------------

    {
        "request": {
            "url": "http://qa/api/v1/hierarchy/",
            "method": "GET",
        },
        "response": {
            "code": 200,
            "data": {
                "meta": {
                    "limit": 1000,
                    "next": null,
                    "offset": 0,
                    "previous": null,
                    "total_count": 8
                },
                "objects": [
                    {
                        "emis": 1
                    },
                    {
                        "emis": 2
                    },
                    {
                        "emis": 45
                    },
                    {
                        "emis": 777
                    },
                    {
                        "emis": 7764
                    },
                    {
                        "emis": 2334
                    },
                    {
                        "emis": 2342
                    },
                    {
                        "emis": 4342
                    }
                ]
            }
        },
    },


    // cms_district_admin_registration
    // -------------------------------

    {
        "request": {
            "method": "POST",
            "headers": {
                'Content-Type': ['application/json']
            },
            "url": "http://qa/api/v1/district_admin/",
            "data": {
                "first_name": "Michael",
                "last_name": "Sherwin",
                "date_of_birth": "1980-11-27",
                "district": "/api/v1/district/1/",
                "id_number": "123454321"
            }
        },
        "response": {
            "code": 201,
            "data": {
                "created_at": "2014-02-03T12:22:38.158000",
                "date_of_birth": "1985-11-27T10:00:00",
                "district": {
                    "id": 1,
                    "name": "Mporokoso",
                    "province": {
                        "id": 15,
                        "name": "Northern Province",
                        "resource_uri": "/api/v1/province/1/"
                    },
                    "resource_uri": "/api/v1/district/1/"
                },
                "first_name": "Michael",
                "id": 2,
                "id_number": "123454321",
                "last_name": "Sherwin",
                "resource_uri": "/api/v1/district_admin/2/"
            }
        }
    },


    // cms_head_teacher_registration
    // -----------------------------

        // user is zonal head
    {
        "request": {
            "method": "POST",
            "headers": {
                'Content-Type': ['application/json']
            },
            "url": "http://qa/api/v1/data/headteacher/",
            "data": {
                "date_of_birth": "1980-09-11",
                "emis": "/api/v1/school/emis/1/",
                "first_name": "Jack",
                "gender": "male",
                "is_zonal_head": true,
                "last_name": "Black",
                "msisdn": "097123",
                "zonal_head_name": "self"
            }
        },
        "response": {
            "code": 201,
            "data": {
                "created_at": "2013-08-14T19:57:50.232678",
                "date_of_birth": "1980-09-11T00:00:00",
                "emis": {
                    "emis": 1,
                    "id": 1,
                    "name": "School One",
                    "resource_uri": "/api/v1/school/1/",
                    "zone": {
                        "district": {
                            "id": 1,
                            "name": "District One",
                            "province": {
                                "id": 1,
                                "name": "Province One",
                                "resource_uri": "/api/v1/province/1/"
                            },
                            "resource_uri": "/api/v1/district/1/"
                        },
                        "id": 1,
                        "name": "Zone One",
                        "resource_uri": "/api/v1/zone/1/"
                    }
                },
                "first_name": "Jack",
                "gender": "male",
                "id": 2,
                "is_zonal_head": true,
                "last_name": "Black",
                "msisdn": "097123",
                "resource_uri": "/api/data/headteacher/2/",
                "zonal_head_name": "self"
            }
        }
    },


        // user is not zonal head
    {
        "request": {
            "method": "POST",
            "headers": {
                'Content-Type': ['application/json']
            },
            "url": "http://qa/api/v1/data/headteacher/",
            "data": {
                "date_of_birth": "1980-09-11",
                "emis": "/api/v1/school/emis/1/",
                "first_name": "Jack",
                "gender": "male",
                "is_zonal_head": false,
                "last_name": "Black",
                "msisdn": "097123",
                "zonal_head_name": "Jim Carey"
            }
        },
        "response": {
            "code": 201,
            "data": {
                "created_at": "2013-08-14T19:57:50.232678",
                "date_of_birth": "1980-09-11T00:00:00",
                "emis": {
                    "emis": 1,
                    "id": 1,
                    "name": "School One",
                    "resource_uri": "/api/v1/school/1/",
                    "zone": {
                        "district": {
                            "id": 1,
                            "name": "District One",
                            "province": {
                                "id": 1,
                                "name": "Province One",
                                "resource_uri": "/api/v1/province/1/"
                            },
                            "resource_uri": "/api/v1/district/1/"
                        },
                        "id": 1,
                        "name": "Zone One",
                        "resource_uri": "/api/v1/zone/1/"
                    }
                },
                "first_name": "Jack",
                "gender": "male",
                "id": 2,
                "is_zonal_head": false,
                "last_name": "Black",
                "msisdn": "097123",
                "resource_uri": "/api/data/headteacher/2/",
                "zonal_head_name": "Jim Carey"
            }
        }
    },

        // post school data
    {
        "request": {
            "method": "POST",
            "headers": {
                'Content-Type': ['application/json']
            },
            "url": "http://qa/api/v1/data/school/",
            "data": {
                "boys_g2": 10,
                "classrooms": 5,
                "created_by": "/api/v1/data/headteacher/2/",
                "emis": "/api/v1/school/emis/1/",
                "girls_g2": 11,
                "name":"School One",
                "teachers": 5,
                "teachers_g1": 2,
                "teachers_g2": 2,
                "boys": 50,
                "girls": 51
            }
        },
        "response": {
            "code": 201,
            "data": {
                "created_at": "2013-08-14T19:57:50.232678",
                "emis": {
                    "emis": 1,
                    "id": 1,
                    "name": "School One",
                    "resource_uri": "/api/v1/school/1/",
                    "zone": {
                        "district": {
                            "id": 1,
                            "name": "District One",
                            "province": {
                                "id": 1,
                                "name": "Province One",
                                "resource_uri": "/api/v1/province/1/"
                            },
                            "resource_uri": "/api/v1/district/1/"
                        },
                        "id": 1,
                        "name": "Zone One",
                        "resource_uri": "/api/v1/zone/1/"
                    }
                },
                "boys_g2": 10,
                "classrooms": 5,
                "girls_g2": 11,
                "name": "School One",
                "resource_uri": "/api/data/school/2/",
                "teachers": 5,
                "teachers_g1": 2,
                "teachers_g2": 2,
                "boys": 50,
                "girls": 51
            }
        }
    },


    // cms_change_management
    // ---------------------

        // change cellphone number - get headteacher by emis (manage_change_msisdn_emis)
    {
        "request": {
            "method": "GET",
            "headers": {
                'Content-Type': ['application/json']
            },
            "url": "http://qa/api/v1/data/headteacher/?emis__emis=1"
        },
        "response": {
            "code": 200,
            "data": {
                "meta": {
                    "limit": 1000,
                    "next": null,
                    "offset": 0,
                    "previous": null,
                    "total_count": 18
                },
                "objects": [
                    {
                        "created_at": "2013-08-14T19:57:50.232678",
                        "date_of_birth": "1980-09-11T00:00:00",
                        "emis": {
                            "emis": 1,
                            "id": 1,
                            "name": "School One",
                            "resource_uri": "/api/v1/school/1/",
                            "zone": {
                                "district": {
                                    "id": 1,
                                    "name": "District One",
                                    "province": {
                                        "id": 1,
                                        "name": "Province One",
                                        "resource_uri": "/api/v1/province/1/"
                                    },
                                    "resource_uri": "/api/v1/district/1/"
                                },
                                "id": 1,
                                "name": "Zone One",
                                "resource_uri": "/api/v1/zone/1/"
                            }
                        },
                        "first_name": "Jack",
                        "gender": "male",
                        "id": 2,
                        "is_zonal_head": false,
                        "last_name": "Black",
                        "msisdn": "097123",
                        "resource_uri": "/api/data/headteacher/2/",
                        "zonal_head_name": "Jim Carey"
                    }
                ]

            }
        }
    },


        // change cellphone number - patch msisdn in headteacher (manage_change_msisdn_emis)
    {
        "request": {
            "method": "PATCH",
            "headers": {
                'Content-Type': ['application/json']
            },
            "url": "http://qa/api/v1/data/headteacher/2/",
            "data": {
                "msisdn": "097666",
            },
        },
        "response": {
            "code": 201,
            "data": {
                "created_at": "2013-08-14T19:57:50.232678",
                "date_of_birth": "1980-09-11T00:00:00",
                "emis": {
                    "emis": 1,
                    "id": 1,
                    "name": "School One",
                    "resource_uri": "/api/v1/school/1/",
                    "zone": {
                        "district": {
                            "id": 1,
                            "name": "District One",
                            "province": {
                                "id": 1,
                                "name": "Province One",
                                "resource_uri": "/api/v1/province/1/"
                            },
                            "resource_uri": "/api/v1/district/1/"
                        },
                        "id": 1,
                        "name": "Zone One",
                        "resource_uri": "/api/v1/zone/1/"
                    }
                },
                "first_name": "Jack",
                "gender": "male",
                "id": 2,
                "is_zonal_head": false,
                "last_name": "Black",
                "msisdn": "097666",
                "resource_uri": "/api/data/headteacher/2/",
                "zonal_head_name": "Jim Carey"
            }
        }
    },




        // change school - patch emis in headteacher (manage_change_emis)
    {
        "request": {
            "method": "PATCH",
            "headers": {
                'Content-Type': ['application/json']
            },
            "url": "http://qa/api/v1/data/headteacher/555/",
            "data": {
                "emis": "/api/v1/school/emis/2334/",
            },
        },
        "response": {
            "code": 201,
            "data": {
                "created_at": "2013-08-14T19:57:50.232678",
                "date_of_birth": "1980-09-11T00:00:00",
                "emis": {
                    "emis": 2334,
                    "id": 1,
                    "name": "School One",
                    "resource_uri": "/api/v1/school/1/",
                    "zone": {
                        "district": {
                            "id": 1,
                            "name": "District One",
                            "province": {
                                "id": 1,
                                "name": "Province One",
                                "resource_uri": "/api/v1/province/1/"
                            },
                            "resource_uri": "/api/v1/district/1/"
                        },
                        "id": 1,
                        "name": "Zone One",
                        "resource_uri": "/api/v1/zone/1/"
                    }
                },
                "first_name": "Regina",
                "gender": "female",
                "id": 555,
                "is_zonal_head": true,
                "last_name": "Spektor",
                "msisdn": "097555",
                "resource_uri": "/api/data/headteacher/555/",
                "zonal_head_name": "self"
            }
        }
    },

        // change school - post school data (manage_change_emis)

    {
        "request": {
            "method": "POST",
            "headers": {
                'Content-Type': ['application/json']
            },
            "url": "http://qa/api/v1/data/school/",
            "data": {
                "classrooms": 5,
                "teachers": 5,
                "teachers_g1": 2,
                "teachers_g2": 2,
                "boys_g2": 10,
                "girls_g2": 11,
                "boys": 50,
                "girls": 51,
                "created_by": "/api/v1/data/headteacher/555/",
                "emis": "/api/v1/school/emis/2334/"
            }
        },
        "response": {
            "code": 201,
            "data": {}
        }
    },




        // update school data - get headteacher by emis (manage_update_school_data)
    {
        "request": {
            "method": "GET",
            "headers": {
                'Content-Type': ['application/json']
            },
            "url": "http://qa/api/v1/data/headteacher/?emis__emis=45"
        },
        "response": {
            "code": 200,
            "data": {
                "meta": {
                    "limit": 1000,
                    "next": null,
                    "offset": 0,
                    "previous": null,
                    "total_count": 18
                },
                "objects": [
                    {
                        "created_at": "2013-08-14T19:57:50.232678",
                        "date_of_birth": "1980-09-11T00:00:00",
                        "emis": {
                            "emis": 45,
                            "id": 1,
                            "name": "School One",
                            "resource_uri": "/api/v1/school/1/",
                            "zone": {
                                "district": {
                                    "id": 1,
                                    "name": "District One",
                                    "province": {
                                        "id": 1,
                                        "name": "Province One",
                                        "resource_uri": "/api/v1/province/1/"
                                    },
                                    "resource_uri": "/api/v1/district/1/"
                                },
                                "id": 1,
                                "name": "Zone One",
                                "resource_uri": "/api/v1/zone/1/"
                            }
                        },
                        "first_name": "Regina",
                        "gender": "female",
                        "id": 555,
                        "is_zonal_head": true,
                        "last_name": "Spektor",
                        "msisdn": "097555",
                        "resource_uri": "/api/data/headteacher/555/",
                        "zonal_head_name": "self"
                    }
                ]
            }
        }
    },


        // update school data - post school data (manage_update_school_data)
    {
        "request": {
            "method": "POST",
            "headers": {
                'Content-Type': ['application/json']
            },
            "url": "http://qa/api/v1/data/school/",
            "data": {
                "classrooms": 5,
                "teachers": 5,
                "teachers_g1": 2,
                "teachers_g2": 2,
                "boys_g2": 10,
                "girls_g2": 11,
                "boys": 33,
                "girls": 51,
                "created_by": "/api/v1/data/headteacher/555/",
                "emis": "/api/v1/school/emis/45/"
            }
        },
        "response": {
            "code": 201,
            "data": {}
        }
    },



    // cms_learner_performance
    // -----------------------

        // head teacher boys
    {
        "request": {
            "method": "POST",
            "headers": {
                'Content-Type': ['application/json']
            },
            "url": "http://qa/api/v1/data/learnerperformance/",
            "data": {
                "below_minimum_results": "7",
                "created_by": "/api/v1/data/headteacher/555/",
                "desirable_results": "15",
                "emis": "/api/v1/school/emis/45/",
                "gender": "boys",
                "minimum_results": "20",
                "outstanding_results": "10",
                "phonetic_awareness": "31",
                "reading_comprehension": "35",
                "total_number_pupils": "52",
                "vocabulary": "33",
                "writing_diction": "37"
            }
        },
        "response": {
            "code": 201,
            "data": {}
        }
    },

        // head teacher girls
    {
        "request": {
            "method": "POST",
            "headers": {
                'Content-Type': ['application/json']
            },
            "url": "http://qa/api/v1/data/learnerperformance/",
            "data": {
                "below_minimum_results": "4",
                "created_by": "/api/v1/data/headteacher/555/",
                "desirable_results": "15",
                "emis": "/api/v1/school/emis/45/",
                "gender": "girls",
                "minimum_results": "20",
                "outstanding_results": "10",
                "phonetic_awareness": "32",
                "reading_comprehension": "36",
                "total_number_pupils": "49",
                "vocabulary": "34",
                "writing_diction": "38"
            }
        },
        "response": {
            "code": 201,
            "data": {}
        }
    },


        // district admin boys
    {
        "request": {
            "method": "POST",
            "headers": {
                'Content-Type': ['application/json']
            },
            "url": "http://qa/api/v1/data/learnerperformance/",
            "data": {
                "below_minimum_results": "7",
                "created_by_da": "/api/v1/district_admin/444/",
                "desirable_results": "15",
                "emis": "/api/v1/school/emis/0001/",
                "gender": "boys",
                "minimum_results": "20",
                "outstanding_results": "10",
                "phonetic_awareness": "31",
                "reading_comprehension": "35",
                "total_number_pupils": "52",
                "vocabulary": "33",
                "writing_diction": "37"
            }
        },
        "response": {
            "code": 201,
            "data": {}
        }
    },

        // district admin girls
    {
        "request": {
            "method": "POST",
            "headers": {
                'Content-Type': ['application/json']
            },
            "url": "http://qa/api/v1/data/learnerperformance/",
            "data": {
                "below_minimum_results": "4",
                "created_by_da": "/api/v1/district_admin/444/",
                "desirable_results": "15",
                "emis": "/api/v1/school/emis/0001/",
                "gender": "girls",
                "minimum_results": "20",
                "outstanding_results": "10",
                "phonetic_awareness": "32",
                "reading_comprehension": "36",
                "total_number_pupils": "49",
                "vocabulary": "34",
                "writing_diction": "38"
            }
        },
        "response": {
            "code": 201,
            "data": {}
        }
    },



    // cms_teacher_performance
    // -----------------------

        // head teacher
    {
        "request": {
            "method": "POST",
            "headers": {
                'Content-Type': ['application/json']
            },
            "url": "http://qa/api/v1/data/teacherperformance/",
            "data": {
                "academic_level": "/api/v1/data/achievement/3/",
                "age": "30",
                "attitudes_and_beliefs": "16",
                "classroom_environment_score": "8",
                "created_by": "/api/v1/data/headteacher/555/",
                "emis": "/api/v1/school/emis/45/",
                "g2_pupils_present": "40",
                "g2_pupils_registered": "50",
                "gender": "female",
                "pupil_engagement_score": "17",
                "pupils_books_number": "90",
                "pupils_materials_score": "6",
                "reading_lesson": "14",
                "reading_assessment": "10",
                "reading_total": "9",
                "t_l_materials": "7",
                "training_subtotal": "3",
                "ts_number": "106",
                "years_experience": "0-3"
            }
        },
        "response": {
            "code": 201,
            "data": {}
        }
    },

        // district official
    {
        "request": {
            "method": "POST",
            "headers": {
                'Content-Type': ['application/json']
            },
            "url": "http://qa/api/v1/data/teacherperformance/",
            "data": {
                "academic_level": "/api/v1/data/achievement/3/",
                "age": "30",
                "attitudes_and_beliefs": "16",
                "classroom_environment_score": "8",
                "created_by_da": "/api/v1/district_admin/444/",
                "emis": "/api/v1/school/emis/0001/",
                "g2_pupils_present": "40",
                "g2_pupils_registered": "50",
                "gender": "female",
                "pupil_engagement_score": "17",
                "pupils_books_number": "90",
                "pupils_materials_score": "6",
                "reading_lesson": "14",
                "reading_assessment": "10",
                "reading_total": "9",
                "t_l_materials": "7",
                "training_subtotal": "3",
                "ts_number": "106",
                "years_experience": "0-3"
            }
        },
        "response": {
            "code": 201,
            "data": {}
        }
    },



    // cms_school_monitoring
    // ---------------------

        // no-plan school
    {
        "request": {
            "method": "POST",
            "headers": {
                'Content-Type': ['application/json']
            },
            "url": "http://qa/api/v1/data/school_monitoring/",
            "data": {
                "see_lpip":"no",
                "g2_observation_results":"no",
                "gala_sheets":"no",
                "created_by": "/api/v1/data/headteacher/555/",
                "emis":"/api/v1/school/emis/4342/"
            }
        },
        "response": {
            "code": 201,
            "data": {}
        }
    },


        // good-plan school
    {
        "request": {
            "method": "POST",
            "headers": {
                'Content-Type': ['application/json']
            },
            "url": "http://qa/api/v1/data/school_monitoring/",
            "data": {
                "see_lpip":"yes",
                "teaching":"no",
                "learner_assessment":"yes_in_progress",
                "learning_materials":"yes",
                "learner_attendance":"no",
                "reading_time":"yes_in_progress",
                "struggling_learners":"yes",
                "g2_observation_results":"yes_in_progress",
                "ht_feedback":"yes",
                "submitted_classroom":"yes_paper",
                "gala_sheets":"yes",
                "summary_worksheet":"no",
                "submitted_gala":"no",
                "talking_wall":"yes_not_updated",
                "created_by": "/api/v1/data/headteacher/555/",
                "emis":"/api/v1/school/emis/4342/"
            }
        },
        "response": {
            "code": 201,
            "data": {}
        }
    },


    // province metrics
    // ----------------

        // looks up a school via emis to get province
    {
        "request": {
            "method": "GET",
            "headers": {
                'Content-Type': ['application/json']
            },
            "url": "http://qa/api/v1/school?emis=45"
        },
        "response": {
            "code": 200,
            "data": {
                "meta": {
                    "limit": 1000,
                    "next": null,
                    "offset": 0,
                    "previous": null,
                     "total_count": 1
                },
                "objects": [
                    {
                        "emis": 45,
                        "id": 1,
                        "name": "test_school 1",
                        "resource_uri": "/api/v1/school/1/",
                        "zone": {
                            "district": {
                                "id": 1,
                                "name": "test_district 1",
                                "province": {
                                    "id": 1,
                                    "name": "test_province",
                                    "resource_uri": "/api/v1/province/1/"
                                },
                                "resource_uri": "/api/v1/district/1/"
                            },
                            "id": 1,
                            "name": "test_zone 1",
                            "resource_uri": "/api/v1/zone/1/"
                        }
                    }
                ]
            }
        }
    },

    {
        "request": {
            "method": "GET",
            "headers": {
                'Content-Type': ['application/json']
            },
            "url": "http://qa/api/v1/school?emis=0001"
        },
        "response": {
            "code": 200,
            "data": {
                "meta": {
                    "limit": 1000,
                    "next": null,
                    "offset": 0,
                    "previous": null,
                     "total_count": 1
                },
                "objects": [
                    {
                        "emis": 1,
                        "id": 1,
                        "name": "test_school 1",
                        "resource_uri": "/api/v1/school/1/",
                        "zone": {
                            "district": {
                                "id": 1,
                                "name": "test_district 1",
                                "province": {
                                    "id": 1,
                                    "name": "test_province",
                                    "resource_uri": "/api/v1/province/1/"
                                },
                                "resource_uri": "/api/v1/district/1/"
                            },
                            "id": 1,
                            "name": "test_zone 1",
                            "resource_uri": "/api/v1/zone/1/"
                        }
                    }
                ]
            }
        }
    },



    ];
};
