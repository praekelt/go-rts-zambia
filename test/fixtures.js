module.exports = function() {
    return [
    
    // EXAMPLE
    // -------
    {
        "request": {
            "method": "POST",
            "url": "http://example.com",
            "data": {
                "bar": "baz"
            }
        },
        "response": {
            "code": 200,
            "data": {
                "foo": "spam"
            }
        }
    },


    // DISTRICT
    // --------
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
    }

    ];
};
