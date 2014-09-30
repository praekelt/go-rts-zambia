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

    ];
};
