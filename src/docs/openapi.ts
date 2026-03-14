export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Weccoo API',
    version: '1.1.1',
    description: 'Documentation Swagger des fonctionnalités backend actuellement opérationnelles.'
  },
  servers: [
    {
      url: 'http://localhost:4000/api',
      description: 'Local'
    }
  ],
  tags: [
    { name: 'Health' },
    { name: 'Auth' },
    { name: 'Items' },
    { name: 'Users' },
    { name: 'Stats' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      ApiMessage: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          data: {}
        },
        required: ['message', 'data']
      },
      ApiError: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          data: { nullable: true }
        },
        required: ['message', 'data']
      },
      AuthUser: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'u1' },
          fullName: { type: 'string', example: 'Baye Leyty' },
          email: { type: 'string', format: 'email', example: 'baye@ucad.sn' },
          university: { type: 'string', example: 'Universite Cheikh Anta Diop' },
          whatsappPhone: { type: 'string', example: '+221771234567' }
        },
        required: ['id', 'fullName', 'email', 'university', 'whatsappPhone']
      },
      AuthResponse: {
        type: 'object',
        properties: {
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          user: { $ref: '#/components/schemas/AuthUser' }
        },
        required: ['token', 'user']
      },
      SignupRequest: {
        type: 'object',
        properties: {
          fullName: { type: 'string', example: 'Baye Leyty' },
          university: { type: 'string', example: 'UCAD' },
          email: { type: 'string', format: 'email', example: 'baye@ucad.sn' },
          whatsappPhone: { type: 'string', example: '+221771234567' },
          password: { type: 'string', example: 'password123' }
        },
        required: ['fullName', 'university', 'email', 'whatsappPhone', 'password']
      },
      LoginRequest: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email', example: 'baye@ucad.sn' },
          password: { type: 'string', example: 'password123' }
        },
        required: ['email', 'password']
      },
      VerifyUniversityEmailRequest: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email', example: 'baye@ucad.sn' },
          university: { type: 'string', example: 'UCAD' }
        },
        required: ['email', 'university']
      },
      VerifyUniversityEmailResponse: {
        type: 'object',
        properties: {
          exists: { type: 'boolean', example: true }
        },
        required: ['exists']
      },
      UpdateMeRequest: {
        type: 'object',
        properties: {
          whatsappPhone: { type: 'string', example: '+221771234567' },
          currentPassword: { type: 'string', example: 'ancienMotDePasse' },
          newPassword: { type: 'string', example: 'nouveauMotDePasse123' }
        }
      },
      UpdateMeResponse: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'u1' },
          fullName: { type: 'string', example: 'Baye Leyty' },
          email: { type: 'string', format: 'email', example: 'baye@ucad.sn' },
          university: { type: 'string', example: 'UCAD' },
          whatsappPhone: { type: 'string', example: '+221771234567' }
        },
        required: ['id', 'fullName', 'email', 'university', 'whatsappPhone']
      },
      Item: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'it1' },
          title: { type: 'string', example: 'Physique Quantique — 3eme edition' },
          category: { type: 'string', example: 'Livre' },
          description: { type: 'string', example: 'Manuel en tres bon etat.' },
          condition: { type: 'string', example: 'Tres bon etat' },
          type: { type: 'string', enum: ['don', 'echange', 'pret'] },
          location: { type: 'string', example: 'Paris 14e' },
          ownerId: { type: 'string', example: 'u2' },
          ownerName: { type: 'string', example: 'Awa Diop', nullable: true },
          ownerInitials: { type: 'string', example: 'AD', nullable: true },
          ownerWhatsappPhone: { type: 'string', example: '+221781234567', nullable: true },
          photos: {
            type: 'array',
            items: { type: 'string' },
            example: ['data:image/png;base64,iVBORw0...', 'data:image/jpeg;base64,/9j/4AAQ...']
          },
          likesCount: { type: 'number', example: 3 },
          viewsCount: { type: 'number', example: 12 },
          createdAt: { type: 'string', format: 'date-time' }
        },
        required: [
          'id',
          'title',
          'category',
          'description',
          'condition',
          'type',
          'location',
          'ownerId',
          'photos',
          'likesCount',
          'viewsCount',
          'createdAt'
        ]
      },
      CreateItemRequest: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          category: { type: 'string' },
          description: { type: 'string' },
          condition: { type: 'string' },
          type: { type: 'string', enum: ['don', 'echange', 'pret'] },
          location: { type: 'string' },
          photos: {
            type: 'array',
            items: { type: 'string' },
            description:
              "Liste d'images (base64 ou URLs). Au moins une photo est requise (sinon 400)."
          }
        },
        required: ['title', 'category', 'description', 'condition', 'type', 'location', 'photos']
      },
      ToggleLikeResponse: {
        type: 'object',
        properties: {
          item: { $ref: '#/components/schemas/Item' },
          liked: { type: 'boolean', example: true }
        },
        required: ['item', 'liked']
      },
      ItemLikeReceived: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'like1' },
          createdAt: { type: 'string', format: 'date-time' },
          item: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'it1' },
              title: { type: 'string', example: 'Physique Quantique — 3eme edition' },
              type: { type: 'string', enum: ['don', 'echange', 'pret'] }
            },
            required: ['id', 'title', 'type']
          },
          liker: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'u2' },
              fullName: { type: 'string', example: 'Awa Diop' },
              initials: { type: 'string', example: 'AD' }
            },
            required: ['id', 'fullName', 'initials']
          }
        },
        required: ['id', 'createdAt', 'item', 'liker']
      },
      Stats: {
        type: 'object',
        properties: {
          itemsCount: { type: 'number', example: 42 },
          usersCount: { type: 'number', example: 10 }
        },
        required: ['itemsCount', 'usersCount']
      },
      ApiAuthResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          data: { $ref: '#/components/schemas/AuthResponse' }
        },
        required: ['message', 'data']
      },
      ApiVerifyUniversityEmailResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          data: { $ref: '#/components/schemas/VerifyUniversityEmailResponse' }
        },
        required: ['message', 'data']
      },
      ApiItemListResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          data: { type: 'array', items: { $ref: '#/components/schemas/Item' } }
        },
        required: ['message', 'data']
      },
      ApiItemResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          data: { $ref: '#/components/schemas/Item' }
        },
        required: ['message', 'data']
      },
      ApiToggleLikeResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          data: { $ref: '#/components/schemas/ToggleLikeResponse' }
        },
        required: ['message', 'data']
      },
      ApiItemLikeReceivedListResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          data: { type: 'array', items: { $ref: '#/components/schemas/ItemLikeReceived' } }
        },
        required: ['message', 'data']
      },
      ApiUpdateMeResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          data: { $ref: '#/components/schemas/UpdateMeResponse' }
        },
        required: ['message', 'data']
      },
      ApiStatsResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          data: { $ref: '#/components/schemas/Stats' }
        },
        required: ['message', 'data']
      }
    }
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Santé applicative',
        responses: {
          '200': {
            description: 'Application OK',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiMessage' },
                example: { message: 'Backend is running', data: null }
              }
            }
          }
        }
      }
    },
    '/health/database': {
      get: {
        tags: ['Health'],
        summary: 'Santé base de données',
        responses: {
          '200': {
            description: 'DB reachable',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiMessage' },
                example: { message: 'Database is reachable', data: { database: 'up' } }
              }
            }
          },
          '503': {
            description: 'DB unreachable',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
                example: { message: 'Database is not reachable', data: { database: 'down' } }
              }
            }
          }
        }
      }
    },
    '/auth': {
      get: {
        tags: ['Auth'],
        summary: 'Vérifie le module Auth',
        responses: {
          '200': {
            description: 'Module auth monté',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiMessage' },
                example: { message: 'Auth routes initialized', data: { module: 'auth' } }
              }
            }
          }
        }
      }
    },
    '/auth/signup': {
      post: {
        tags: ['Auth'],
        summary: 'Inscription utilisateur',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SignupRequest' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Compte créé',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiAuthResponse' }
              }
            }
          },
          '409': {
            description: 'Email déjà utilisé',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' }
              }
            }
          }
        }
      }
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Connexion utilisateur',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Connexion réussie',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiAuthResponse' }
              }
            }
          },
          '401': {
            description: 'Identifiants invalides',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' }
              }
            }
          }
        }
      }
    },
    '/auth/verify-university-email': {
      post: {
        tags: ['Auth'],
        summary: 'Vérifier un email universitaire',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/VerifyUniversityEmailRequest' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Résultat de la vérification',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiVerifyUniversityEmailResponse' }
              }
            }
          },
          '400': {
            description: 'Payload invalide',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' }
              }
            }
          },
          '500': {
            description: "Base d'emails indisponible",
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' }
              }
            }
          }
        }
      }
    },
    '/users/me': {
      patch: {
        tags: ['Users'],
        summary: 'Mettre à jour mon profil',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateMeRequest' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Profil mis à jour',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiUpdateMeResponse' }
              }
            }
          },
          '400': {
            description: 'Payload invalide',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' }
              }
            }
          },
          '401': {
            description: 'Non autorisé',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' }
              }
            }
          },
          '404': {
            description: 'Utilisateur introuvable',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' }
              }
            }
          }
        }
      }
    },
    '/items': {
      get: {
        tags: ['Items'],
        summary: 'Lister les objets',
        responses: {
          '200': {
            description: 'Liste récupérée',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiItemListResponse' }
              }
            }
          }
        }
      },
      post: {
        tags: ['Items'],
        summary: 'Créer un objet',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateItemRequest' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Objet créé',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiItemResponse' }
              }
            }
          },
          '400': {
            description: 'Payload invalide',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' }
              }
            }
          },
          '401': {
            description: 'Token manquant ou invalide',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' }
              }
            }
          }
        }
      }
    },
    '/items/received-likes/{userId}': {
      get: {
        tags: ['Items'],
        summary: "Lister les likes reçus d'un utilisateur",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'userId',
            required: true,
            schema: { type: 'string' }
          },
          {
            in: 'query',
            name: 'limit',
            required: false,
            schema: { type: 'number', example: 10 },
            description: 'Nombre de résultats (max 50).'
          }
        ],
        responses: {
          '200': {
            description: 'Likes récupérés',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiItemLikeReceivedListResponse' }
              }
            }
          },
          '401': {
            description: 'Token manquant ou invalide',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' }
              }
            }
          },
          '403': {
            description: 'Accès interdit',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' }
              }
            }
          }
        }
      }
    },
    '/items/{id}': {
      get: {
        tags: ['Items'],
        summary: 'Détail d\'un objet',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'Objet trouvé',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiItemResponse' }
              }
            }
          },
          '404': {
            description: 'Objet introuvable',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' }
              }
            }
          }
        }
      }
    },
    '/items/{id}/view': {
      post: {
        tags: ['Items'],
        summary: "Enregistrer une vue sur un objet",
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'Vue enregistrée',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiItemResponse' }
              }
            }
          },
          '404': {
            description: 'Objet introuvable',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' }
              }
            }
          }
        }
      }
    },
    '/items/{id}/like': {
      post: {
        tags: ['Items'],
        summary: 'Liker / unliker un objet',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'Like mis à jour',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiToggleLikeResponse' }
              }
            }
          },
          '401': {
            description: 'Token manquant ou invalide',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' }
              }
            }
          },
          '404': {
            description: 'Objet introuvable',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' }
              }
            }
          }
        }
      }
    },
    '/stats': {
      get: {
        tags: ['Stats'],
        summary: 'Statistiques globales',
        responses: {
          '200': {
            description: 'Stats récupérées',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiStatsResponse' }
              }
            }
          }
        }
      }
    }
  }
} as const;
